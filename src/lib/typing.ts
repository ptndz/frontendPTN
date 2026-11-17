/**
 * Typing indicator ("đang nhập...") — logic thuần, không gọi API/DOM.
 *
 * Backend P2.2a (src/routers/socket.ts): client emit "typing"/"stopTyping"
 * { conversationId } -> server broadcast "userTyping"/"userStoppedTyping".
 * Server tự hết hạn sau TYPING_SERVER_EXPIRY_MS nếu client quên gửi
 * stopTyping (mất mạng, đóng tab). Client/bot còn gõ thì gửi lại
 * "typing" mỗi TYPING_REEMIT_MS — phải ngắn hơn hạn server để
 * indicator không nhấp nháy tắt/mở giữa chừng.
 */

/** Server tự báo dừng gõ sau 5s không nhận lại "typing" (socket.ts). */
export const TYPING_SERVER_EXPIRY_MS = 5000;

/** Nhịp gửi lại "typing" khi còn gõ (frontend emitTyping + Bot Client). */
export const TYPING_REEMIT_MS = 2000;

/**
 * Tên hiển thị của người đang gõ. Bot thì gắn " [BOT AI]" sau tên cho
 * khớp nhãn bot ở các chỗ khác (tin nhắn, gợi ý @mention, panel nhóm).
 * Tên rỗng thì trả rỗng (bên gọi tự fallback "Someone").
 */
export function typingDisplayName(fullName: string, isBot: boolean): string {
  const name = fullName || "";
  if (!name) return "";
  return isBot ? `${name} [BOT AI]` : name;
}

export type TypingTranslator = (
  key: string,
  vars?: Record<string, string | number>
) => string;

/**
 * Câu "X đang nhập..." từ danh sách tên đã hiển thị. Tên rỗng bị loại.
 * 0 tên -> null (không hiện gì); 1 tên -> "{name} đang nhập...";
 * nhiều tên -> nối bằng ", ".
 */
export function buildTypingText(
  names: string[],
  t: TypingTranslator
): string | null {
  const shown = names.filter(Boolean);
  if (shown.length === 0) return null;
  if (shown.length === 1)
    return t("messenger.typing", { name: shown[0] });
  return t("messenger.typing", { name: shown.join(", ") });
}
