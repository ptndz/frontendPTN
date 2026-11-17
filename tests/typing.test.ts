/**
 * Test logic thuần trong src/lib/typing.ts (không gọi API, không DOM).
 * Typing indicator: tên hiển thị + câu "đang nhập..." + nhịp gửi lại.
 */
import { describe, expect, it } from "vitest";
import {
  buildTypingText,
  TYPING_REEMIT_MS,
  TYPING_SERVER_EXPIRY_MS,
  typingDisplayName,
} from "../src/lib/typing";

const fakeT = (key: string, vars?: Record<string, string | number>) =>
  `${key}:${String(vars?.name ?? "")}`;

describe("typingDisplayName", () => {
  it("người thường giữ nguyên tên", () => {
    expect(typingDisplayName("Load 001", false)).toBe("Load 001");
  });
  it("bot gắn ' [BOT AI]' sau tên", () => {
    expect(typingDisplayName("Nyx (Muse Strategy)", true)).toBe(
      "Nyx (Muse Strategy) [BOT AI]"
    );
  });
  it("tên rỗng trả rỗng kể cả bot", () => {
    expect(typingDisplayName("", true)).toBe("");
    expect(typingDisplayName("", false)).toBe("");
  });
});

describe("buildTypingText", () => {
  it("0 tên -> null", () => {
    expect(buildTypingText([], fakeT)).toBe(null);
    expect(buildTypingText(["", ""], fakeT)).toBe(null);
  });
  it("1 tên -> key messenger.typing với tên đó", () => {
    expect(buildTypingText(["Load 001"], fakeT)).toBe(
      "messenger.typing:Load 001"
    );
  });
  it("nhiều tên nối bằng ', '", () => {
    expect(buildTypingText(["A", "B [BOT AI]"], fakeT)).toBe(
      "messenger.typing:A, B [BOT AI]"
    );
  });
  it("loại tên rỗng trước khi nối", () => {
    expect(buildTypingText(["A", ""], fakeT)).toBe("messenger.typing:A");
  });
});

describe("nhịp gửi lại typing", () => {
  it("server hết hạn sau 5s", () => {
    expect(TYPING_SERVER_EXPIRY_MS).toBe(5000);
  });
  it("nhịp gửi lại 2s — ngắn hơn hạn server nên không nhấp nháy", () => {
    expect(TYPING_REEMIT_MS).toBe(2000);
    expect(TYPING_REEMIT_MS).toBeLessThan(TYPING_SERVER_EXPIRY_MS);
  });
});
