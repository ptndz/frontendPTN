import type { NextApiRequest, NextApiResponse } from "next";

/**
 * STAGED — Chưa nối vào luồng login/register. ĐỪNG chuyển Login/Register
 * sang dùng route này cho tới khi backend xong #15b, vì hiện tại 2 kênh
 * auth vẫn cần token đọc được bằng JS:
 *
 * 1. Socket.IO: backend chỉ đọc `socket.handshake.auth.token`
 *    (middlewares/auth.ts socketMiddleware) — không đọc cookie. Cần
 *    backend chấp nhận token từ cookie handshake trước.
 * 2. Refresh: backend POST /refresh_token chỉ đọc `body.refreshToken`
 *    (controllers/auth.ts) — không đọc cookie. Cần backend chấp nhận
 *    refresh token từ cookie trước.
 * 3. Tên cookie: backend đọc access token từ cookie tên "token"
 *    (middlewares/auth.ts), còn frontend dùng NEXT_PUBLIC_COOKIE_NAME.
 *    Route này đặt thêm một bản sao tên "token" để backend nhận ra.
 *
 * Khi 3 việc trên xong, luồng chuyển sang httpOnly sẽ là: Login/Register
 * POST token về route này thay vì setCookie phía client; GraphQL/REST
 * dựa vào cookie trình duyệt tự gửi (credentials: include / withCredentials)
 * thay vì đọc token bằng JS; socket dùng cookie handshake.
 *
 * Route này chỉ đặt/xóa cookie, không bao giờ ghi token vào log.
 */

// Access cookie sống 30 ngày như refresh (xem lib/auth/session.ts): luồng
// refresh cần client vẫn gửi token hết hạn để backend trả JWT_EXPIRED.
const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày
const USER_ID_MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày

// Tên cookie access token mà backend đọc (middlewares/auth.ts).
const BACKEND_TOKEN_COOKIE = "token";

const getAccessTokenCookieName = () =>
  process.env.NEXT_PUBLIC_COOKIE_NAME || "accessToken";
const getRefreshTokenCookieName = () =>
  process.env.NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME || "refreshToken";

// Secure chỉ bật khi request tới qua HTTPS. Deploy hiện tại chạy HTTP qua
// Tailscale — đặt Secure trên HTTP sẽ khiến trình duyệt từ chối cookie.
function isHttpsRequest(req: NextApiRequest): boolean {
  const forwarded = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (proto === "https") return true;
  if (proto === "http") return false;
  return Boolean(
    (req.socket as unknown as { encrypted?: boolean }).encrypted
  );
}

function serializeCookie(
  name: string,
  value: string,
  opts: { maxAge: number; httpOnly: boolean; secure: boolean }
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${opts.maxAge}`,
    "Path=/",
    "SameSite=Lax",
  ];
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  return parts.join("; ");
}

function setAuthCookies(
  res: NextApiResponse,
  tokens: { accessToken: string; refreshToken: string; userId: string },
  secure: boolean
) {
  res.setHeader("Set-Cookie", [
    serializeCookie(getAccessTokenCookieName(), tokens.accessToken, {
      maxAge: ACCESS_TOKEN_MAX_AGE,
      httpOnly: true,
      secure,
    }),
    // Bản sao tên "token" để backend (middlewares/auth.ts) đọc được.
    serializeCookie(BACKEND_TOKEN_COOKIE, tokens.accessToken, {
      maxAge: ACCESS_TOKEN_MAX_AGE,
      httpOnly: true,
      secure,
    }),
    serializeCookie(getRefreshTokenCookieName(), tokens.refreshToken, {
      maxAge: REFRESH_TOKEN_MAX_AGE,
      httpOnly: true,
      secure,
    }),
    serializeCookie("uuid", tokens.userId, {
      maxAge: USER_ID_MAX_AGE,
      httpOnly: true,
      secure,
    }),
  ]);
}

function clearAuthCookies(res: NextApiResponse) {
  const expired = (name: string) =>
    `${name}=; Max-Age=0; Path=/; SameSite=Lax; HttpOnly`;
  res.setHeader("Set-Cookie", [
    expired(getAccessTokenCookieName()),
    expired(BACKEND_TOKEN_COOKIE),
    expired(getRefreshTokenCookieName()),
    expired("uuid"),
  ]);
}

function isValidToken(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 4096;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { accessToken, refreshToken, userId } = req.body ?? {};
    if (
      !isValidToken(accessToken) ||
      !isValidToken(refreshToken) ||
      !isValidToken(userId)
    ) {
      return res.status(400).json({ ok: false, error: "invalid tokens" });
    }
    setAuthCookies(
      res,
      { accessToken, refreshToken, userId },
      isHttpsRequest(req)
    );
    return res.status(200).json({ ok: true });
  }
  if (req.method === "DELETE") {
    clearAuthCookies(res);
    return res.status(200).json({ ok: true });
  }
  res.setHeader("Allow", ["POST", "DELETE"]);
  return res.status(405).json({ ok: false, error: "method not allowed" });
}
