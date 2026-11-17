/**
 * Bot account MXH (thiết kế mục 4.2 — MXH × code/web).
 *
 * Bot là hàng `User` có `isBot=true` (backend thêm cờ này vào payload
 * `toIUser`/`toPublicUser` — item 8, agent backend làm song song).
 * Frontend KHÔNG được crash khi cờ chưa có: mọi hàm ở đây coi `isBot`
 * là optional, và 3 username bot cố định trong thiết kế được nhận diện
 * thêm bằng username để nhãn [BOT AI] vẫn hiện trong lúc backend
 * chưa kịp đưa cờ vào payload.
 */

/** 3 tài khoản bot trong thiết kế (mục 4.2): ai_nyx, ai_antigravity, ai_chatgpt. */
export const KNOWN_BOT_USERNAMES = [
  "ai_nyx",
  "ai_antigravity",
  "ai_chatgpt",
] as const;

export type KnownBotUsername = (typeof KNOWN_BOT_USERNAMES)[number];

/** Hình tối thiểu của user mà các hàm này cần (payload `any` vẫn xài được). */
export interface BotUserLike {
  isBot?: boolean | null;
  username?: string | null;
}

export function isKnownBotUsername(
  username: string | null | undefined
): username is KnownBotUsername {
  if (!username) return false;
  return (KNOWN_BOT_USERNAMES as readonly string[]).includes(username);
}

/**
 * User này có phải bot account không?
 * - `isBot === true` (cờ backend), hoặc
 * - username thuộc 3 tài khoản bot cố định (dự phòng lúc cờ chưa có).
 * `isBot` absent/null/false + username lạ -> false, không crash.
 */
export function isBotUser(
  user: BotUserLike | null | undefined
): boolean {
  if (!user) return false;
  if (user.isBot === true) return true;
  return isKnownBotUsername(user.username);
}

/** Lọc trong 1 danh sách user chỉ giữ các bot account đã biết (khớp chính xác username). */
export function pickKnownBots<T extends BotUserLike>(users: readonly T[]): T[] {
  return users.filter((u) => isKnownBotUsername(u.username));
}

/** Các username bot cố định chưa có mặt trong danh sách đã resolve. */
export function missingBotUsernames(
  found: readonly BotUserLike[]
): KnownBotUsername[] {
  const have = new Set(found.map((u) => u.username));
  return KNOWN_BOT_USERNAMES.filter((name) => !have.has(name));
}
