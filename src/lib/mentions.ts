import type { SearchableItem } from "@astryxdesign/core/Typeahead";
import { isBotUser, type BotUserLike } from "./botUsers";

/**
 * @mention trong chat (Messages).
 *
 * - Gợi ý: danh sách thành viên của hội thoại đang mở, map thành
 *   SearchableItem cho trigger "@" của ChatComposerInput (như trigger
 *   "/" cho lệnh slash). Khớp cả username lẫn tên hiển thị.
 * - Tô xanh: tin đã gửi render @username thành chip xanh (Badge
 *   variant="blue"); xem renderChatText trong MessageContent.
 */

/** Hình tối thiểu của 1 thành viên hội thoại mà mention cần. */
export interface MentionMember {
  id: string | number;
  username?: string | null;
  fullName?: string | null;
  avatar?: string | null;
  isBot?: boolean | null;
}

export interface MentionItemAux {
  username: string;
  avatar?: string | null;
  isBot: boolean;
}

export type MentionItem = SearchableItem<MentionItemAux>;

/**
 * Map user của hội thoại -> item gợi ý mention.
 * - Bỏ user không có username (không nhắc được).
 * - Bỏ chính mình (không tự nhắc mình).
 * - label = tên hiển thị (fallback username); username + tên hiển thị
 *   đều dùng làm keyword tìm kiếm.
 */
export function conversationUsersToMentionItems(
  users: readonly (MentionMember & BotUserLike)[] | null | undefined,
  currentUserId?: string | number | null
): MentionItem[] {
  if (!users) return [];
  return users
    .filter((u) => u && typeof u.username === "string" && u.username !== "")
    .filter(
      (u) => currentUserId == null || String(u.id) !== String(currentUserId)
    )
    .map((u) => ({
      id: String(u.id),
      label: u.fullName || (u.username as string),
      auxiliaryData: {
        username: u.username as string,
        avatar: u.avatar ?? null,
        isBot: isBotUser(u),
      },
    }));
}

/** Keywords cho createStaticSource: khớp cả username lẫn tên hiển thị. */
export function mentionItemKeywords(item: MentionItem): string[] {
  const aux = item.auxiliaryData;
  return [aux?.username ?? "", item.label].filter(Boolean);
}

export type MentionTextPart =
  | { type: "text"; text: string }
  | { type: "mention"; username: string };

/**
 * Tách text thành đoạn thường + @mention. Cùng quy tắc token như
 * renderRichText: @ chỉ tách ở đầu từ (sau khoảng trắng / đầu chuỗi)
 * để không ăn nhầm ký tự @ giữa từ, vd email.
 */
const MENTION_TOKEN_RE = /(^|\s)(@[A-Za-z0-9_.]+)/g;

export function splitMentionText(text: string): MentionTextPart[] {
  if (!text || typeof text !== "string") return [];
  const parts: MentionTextPart[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  MENTION_TOKEN_RE.lastIndex = 0;
  while ((match = MENTION_TOKEN_RE.exec(text)) !== null) {
    const [full, prefix, token] = match;
    const start = match.index + prefix.length;
    if (start > lastIndex) {
      parts.push({ type: "text", text: text.slice(lastIndex, start) });
    }
    parts.push({ type: "mention", username: token.slice(1) });
    lastIndex = match.index + full.length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", text: text.slice(lastIndex) });
  }
  return parts;
}
