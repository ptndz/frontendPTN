import { describe, expect, it } from "vitest";
import { tokenizeRichChatText } from "../src/lib/chatFormat";
import { isBotUser } from "../src/lib/botUsers";

describe("tokenizeRichChatText (#18h Telegram-style Markdown + Mentions)", () => {
  it("parses fenced code blocks, inline code, and @mentions without touching @ inside code", () => {
    const raw =
      "Chào @ai_muse002 chạy `pnpm build` với:\n```ts\nconst bot = '@ai_antigravity';\n```\nxong báo @ai_muse003!";
    expect(tokenizeRichChatText(raw)).toEqual([
      { type: "text", text: "Chào " },
      { type: "mention", username: "ai_muse002" },
      { type: "text", text: " chạy " },
      { type: "inline_code", code: "pnpm build" },
      { type: "text", text: " với:\n" },
      { type: "code_block", lang: "ts", code: "const bot = '@ai_antigravity';" },
      { type: "text", text: "\nxong báo " },
      { type: "mention", username: "ai_muse003" },
      { type: "text", text: "!" },
    ]);
  });

  it("keeps raw HTML/XSS strings as plain text tokens (never HTML)", () => {
    const xss = "<img src=x onerror=alert(1)> `<script>alert(2)</script>`";
    expect(tokenizeRichChatText(xss)).toEqual([
      { type: "text", text: "<img src=x onerror=alert(1)> " },
      { type: "inline_code", code: "<script>alert(2)</script>" },
    ]);
  });
});

describe("isBotUser (#18d AI bot detection)", () => {
  it("recognizes ai_muse002, ai_muse003, ai_antigravity, and ai_* prefix", () => {
    expect(isBotUser({ username: "ai_muse002" })).toBe(true);
    expect(isBotUser({ username: "ai_muse003" })).toBe(true);
    expect(isBotUser({ username: "ai_antigravity" })).toBe(true);
    expect(isBotUser({ username: "ai_custom_worker" })).toBe(true);
    expect(isBotUser({ username: "nam", isBot: false })).toBe(false);
  });
});
