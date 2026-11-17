/**
 * Test logic thuần trong src/lib/mentions.ts (không gọi API, không DOM).
 * @mention trong chat: gợi ý thành viên + tách @username khỏi text.
 */
import { describe, expect, it } from "vitest";
import {
  conversationUsersToMentionItems,
  mentionItemKeywords,
  splitMentionText,
} from "../src/lib/mentions";

const MEMBERS = [
  { id: "1", username: "load_001", fullName: "Load 001", avatar: null },
  { id: "2", username: "ai_nyx", fullName: "Nyx (Muse Strategy)", avatar: null, isBot: true },
  { id: "3", username: "ai_antigravity", fullName: "Antigravity Core IDE", avatar: null },
  { id: "4", username: "", fullName: "Không tên", avatar: null },
];

describe("conversationUsersToMentionItems", () => {
  it("map đủ thành viên, label = tên hiển thị, aux giữ username + cờ bot", () => {
    const items = conversationUsersToMentionItems(MEMBERS, "1");
    expect(items.map((i) => i.id)).toEqual(["2", "3"]);
    const nyx = items[0];
    expect(nyx.label).toBe("Nyx (Muse Strategy)");
    expect(nyx.auxiliaryData?.username).toBe("ai_nyx");
    expect(nyx.auxiliaryData?.isBot).toBe(true);
    expect(items[1].auxiliaryData?.isBot).toBe(true);
  });
  it("bỏ chính mình + user không có username", () => {
    const items = conversationUsersToMentionItems(MEMBERS, "1");
    expect(items.some((i) => i.auxiliaryData?.username === "load_001")).toBe(false);
    expect(items.some((i) => i.auxiliaryData?.username === "")).toBe(false);
  });
  it("không truyền currentUserId -> giữ tất cả (trừ user không username)", () => {
    const items = conversationUsersToMentionItems(MEMBERS);
    expect(items.map((i) => i.auxiliaryData?.username)).toEqual([
      "load_001",
      "ai_nyx",
      "ai_antigravity",
    ]);
  });
  it("null/undefined -> []", () => {
    expect(conversationUsersToMentionItems(null)).toEqual([]);
    expect(conversationUsersToMentionItems(undefined)).toEqual([]);
  });
});

describe("mentionItemKeywords", () => {
  it("trả [username, tên hiển thị]", () => {
    const items = conversationUsersToMentionItems(MEMBERS, "1");
    expect(mentionItemKeywords(items[0])).toEqual([
      "ai_nyx",
      "Nyx (Muse Strategy)",
    ]);
  });
});

describe("splitMentionText", () => {
  it("tách @mention ở đầu câu + giữa câu", () => {
    expect(splitMentionText("@ai_nyx chào bạn")).toEqual([
      { type: "mention", username: "ai_nyx" },
      { type: "text", text: " chào bạn" },
    ]);
    expect(splitMentionText("chào @load_001 nhé")).toEqual([
      { type: "text", text: "chào " },
      { type: "mention", username: "load_001" },
      { type: "text", text: " nhé" },
    ]);
  });
  it("nhiều mention + dấu câu sau mention", () => {
    expect(splitMentionText("@ai_nyx, @ai_antigravity!")).toEqual([
      { type: "mention", username: "ai_nyx" },
      { type: "text", text: ", " },
      { type: "mention", username: "ai_antigravity" },
      { type: "text", text: "!" },
    ]);
  });
  it("email không phải mention, #tag không phải mention", () => {
    expect(splitMentionText("gửi a@b.com nhé #tag")).toEqual([
      { type: "text", text: "gửi a@b.com nhé #tag" },
    ]);
  });
  it("text rỗng / không có mention -> text thường hoặc []", () => {
    expect(splitMentionText("")).toEqual([]);
    expect(splitMentionText("không có gì")).toEqual([
      { type: "text", text: "không có gì" },
    ]);
  });
});
