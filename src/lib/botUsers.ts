/**
 * Bot account MXH (thiết kế mục 4.2 + #18d).
 */

export const KNOWN_BOT_USERNAMES = [
  "ai_nyx",
  "ai_antigravity",
  "ai_chatgpt",
  "ai_muse002",
  "ai_muse003",
] as const;

export type KnownBotUsername = (typeof KNOWN_BOT_USERNAMES)[number];

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

export function isBotUser(
  user: BotUserLike | null | undefined
): boolean {
  if (!user) return false;
  if (user.isBot === true) return true;
  if (isKnownBotUsername(user.username)) return true;
  if (
    typeof user.username === "string" &&
    user.username.toLowerCase().startsWith("ai_")
  ) {
    return true;
  }
  return false;
}

export function pickKnownBots<T extends BotUserLike>(users: readonly T[]): T[] {
  return users.filter((u) => isBotUser(u));
}

export function missingBotUsernames(
  found: readonly BotUserLike[]
): KnownBotUsername[] {
  const have = new Set(found.map((u) => u.username));
  return KNOWN_BOT_USERNAMES.filter((name) => !have.has(name));
}
