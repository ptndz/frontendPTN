/**
 * P5a — test logic thuần trong src/lib/notifications.ts (normalize +
 * text theo locale + target điều hướng). Không gọi API.
 */
import { describe, expect, it } from "vitest";
import {
  normalizeNotification,
  notificationTarget,
  notificationText,
  type AppNotification,
} from "../src/lib/notifications";

describe("normalizeNotification", () => {
  it("null / không phải object -> null", () => {
    expect(normalizeNotification(null)).toBeNull();
    expect(normalizeNotification("x")).toBeNull();
  });

  it("shape mới: giữ type/actor/postId/read", () => {
    const n = normalizeNotification({
      id: "n1",
      type: "like",
      actor: { id: "u2", fullName: "Bình", avatar: "a.png" },
      postId: "p9",
      read: false,
      createdAt: "2026-11-10T00:00:00Z",
    });
    expect(n).toMatchObject({
      id: "n1",
      type: "like",
      postId: "p9",
      read: false,
      actor: { id: "u2", fullName: "Bình" },
    });
  });

  it("shape legacy lồng notification: { isRead, notification: {...} }", () => {
    const n = normalizeNotification({
      id: "n2",
      isRead: true,
      notification: {
        content: "Ai đó đã thích bài viết",
        createAt: "2026-11-09",
        senderID: "u3",
        url: "/post/p1",
      },
    });
    expect(n).toMatchObject({
      id: "n2",
      type: "general",
      read: true,
      actorId: "u3",
      content: "Ai đó đã thích bài viết",
      url: "/post/p1",
    });
  });
});

describe("notificationText", () => {
  const base: AppNotification = {
    id: "n1",
    type: "like",
    actor: { id: "u2", fullName: "Bình", avatar: null },
    read: false,
    createdAt: "",
  };

  it("vi: like chèn tên actor", () => {
    expect(notificationText(base, "vi")).toBe("Bình đã thích bài viết của bạn");
  });
  it("vi: comment chèn tên actor", () => {
    expect(notificationText({ ...base, type: "comment" }, "vi")).toBe(
      "Bình đã bình luận về bài viết của bạn"
    );
  });
  it("không có actor -> dùng 'Ai đó'", () => {
    expect(notificationText({ ...base, actor: null }, "vi")).toContain("Ai đó");
  });
  it("content backend gửi sẵn được ưu tiên hơn template", () => {
    expect(
      notificationText({ ...base, content: "Text có sẵn" }, "vi")
    ).toBe("Text có sẵn");
  });
  it("en khác vi nhưng vẫn chứa tên actor", () => {
    const en = notificationText(base, "en");
    expect(en).not.toBe(notificationText(base, "vi"));
    expect(en).toContain("Bình");
  });
});

describe("notificationTarget", () => {
  it("postId -> /post/:id (ưu tiên cao nhất)", () => {
    expect(
      notificationTarget({
        id: "1",
        type: "like",
        postId: "p9",
        conversationId: "3",
        read: false,
        createdAt: "",
      })
    ).toBe("/post/p9");
  });
  it("conversationId -> /messenger", () => {
    expect(
      notificationTarget({
        id: "1",
        type: "message",
        conversationId: "3",
        read: false,
        createdAt: "",
      })
    ).toBe("/messenger");
  });
  it("friend_request -> /friends", () => {
    expect(
      notificationTarget({
        id: "1",
        type: "friend_request",
        read: false,
        createdAt: "",
      })
    ).toBe("/friends");
  });
  it("url dự phòng; không có gì -> null", () => {
    expect(
      notificationTarget({
        id: "1",
        type: "general",
        url: "/x",
        read: false,
        createdAt: "",
      })
    ).toBe("/x");
    expect(
      notificationTarget({ id: "1", type: "general", read: false, createdAt: "" })
    ).toBeNull();
  });
});
