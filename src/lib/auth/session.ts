import { deleteCookie, getCookie, setCookie } from "cookies-next/client";

const ACCESS_TOKEN_COOKIE_FALLBACK = "accessToken";
const REFRESH_TOKEN_COOKIE_FALLBACK = "refreshToken";
const USER_ID_COOKIE_FALLBACK = "uuid";
const LEGACY_AUTH_COOKIE = "awt";

// TTL cookie — thống nhất 30 ngày cho cả access + refresh (xem #13b mục 3).
export const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày
export const USER_ID_MAX_AGE = 60 * 60 * 24 * 30; // 30 ngày

export const getAccessTokenCookieName = () =>
  process.env.NEXT_PUBLIC_COOKIE_NAME || ACCESS_TOKEN_COOKIE_FALLBACK;

export const getRefreshTokenCookieName = () =>
  process.env.NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME ||
  REFRESH_TOKEN_COOKIE_FALLBACK;

export const getAccessToken = () => getCookie(getAccessTokenCookieName());

export const getRefreshToken = () => getCookie(getRefreshTokenCookieName());

const isHttps = () =>
  typeof window !== "undefined" && window.location.protocol === "https:";

const authCookieOptions = (maxAge: number) => ({
  maxAge,
  path: "/",
  sameSite: "lax" as const,
  secure: isHttps(),
});

export const setAccessToken = (
  token: string,
  maxAge = ACCESS_TOKEN_MAX_AGE
) => setCookie(getAccessTokenCookieName(), token, authCookieOptions(maxAge));

export const setRefreshToken = (
  token: string,
  maxAge = REFRESH_TOKEN_MAX_AGE
) => setCookie(getRefreshTokenCookieName(), token, authCookieOptions(maxAge));

export const setAuthCookies = (params: {
  accessToken: string;
  refreshToken: string;
  userId: string;
}) => {
  setCookie("uuid", params.userId, authCookieOptions(USER_ID_MAX_AGE));
  setCookie(
    getAccessTokenCookieName(),
    params.accessToken,
    authCookieOptions(ACCESS_TOKEN_MAX_AGE)
  );
  setCookie(
    getRefreshTokenCookieName(),
    params.refreshToken,
    authCookieOptions(REFRESH_TOKEN_MAX_AGE)
  );
};

export const clearAuthCookies = () => {
  deleteCookie(getAccessTokenCookieName(), { path: "/" });
  deleteCookie(getRefreshTokenCookieName(), { path: "/" });
  deleteCookie(USER_ID_COOKIE_FALLBACK, { path: "/" });
  deleteCookie(LEGACY_AUTH_COOKIE, { path: "/" });
};
