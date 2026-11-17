/**
 * P5a — test logic thuần trong src/lib/social.ts (không gọi API, không DOM).
 * Chỉ import các hàm normalize/pure; các hàm fetch* cần axios + backend nên
 * không test ở đây.
 */
import { describe, expect, it } from "vitest";
import {
  isVideoUrl,
  normalizeFollowUser,
  normalizeGroup,
  normalizeGroupMember,
  normalizePoll,
  normalizeStory,
  partitionMedia,
} from "../src/lib/social";

describe("isVideoUrl", () => {
  it("đuôi video -> true", () => {
    expect(isVideoUrl("https://x/y/clip.mp4")).toBe(true);
    expect(isVideoUrl("https://x/y/clip.webm")).toBe(true);
    expect(isVideoUrl("https://x/y/clip.MOV")).toBe(true);
  });
  it("đuôi ảnh -> false", () => {
    expect(isVideoUrl("https://x/y/a.jpg")).toBe(false);
    expect(isVideoUrl("https://x/y/a.png")).toBe(false);
  });
  it("URL chứa /video/ không cần đuôi file -> true", () => {
    expect(isVideoUrl("https://x/files/video/abc123")).toBe(true);
  });
  it("query/hash sau đuôi không làm sai", () => {
    expect(isVideoUrl("https://x/y/clip.mp4?token=1#t=2")).toBe(true);
    expect(isVideoUrl("https://x/y/a.jpg?x=.mp4")).toBe(false);
  });
  it("chuỗi rỗng -> false", () => {
    expect(isVideoUrl("")).toBe(false);
  });
});

describe("partitionMedia", () => {
  it("tách video và ảnh", () => {
    const { videos, images } = partitionMedia([
      "a.jpg",
      "b.mp4",
      "c.png",
      "https://x/files/video/d",
    ]);
    expect(videos).toEqual(["b.mp4", "https://x/files/video/d"]);
    expect(images).toEqual(["a.jpg", "c.png"]);
  });
  it("null/undefined -> rỗng; phần tử không phải string bị bỏ", () => {
    expect(partitionMedia(null)).toEqual({ videos: [], images: [] });
    expect(partitionMedia(undefined)).toEqual({ videos: [], images: [] });
    expect(partitionMedia(["a.jpg", "" as any, 42 as any])).toEqual({
      videos: [],
      images: ["a.jpg"],
    });
  });
});

describe("normalizeStory", () => {
  it("null / không phải object -> null", () => {
    expect(normalizeStory(null)).toBeNull();
    expect(normalizeStory("x")).toBeNull();
    expect(normalizeStory([])).toBeNull();
  });
  it("thiếu mediaUrl -> null", () => {
    expect(normalizeStory({ id: "1", user: {} })).toBeNull();
  });
  it("suy ra mediaType video từ URL, mặc định viewCount 0", () => {
    const s = normalizeStory({
      id: 7,
      user: { id: "u1", username: "an", avatar: "a.png" },
      mediaUrl: "https://x/c.mp4",
    });
    expect(s).toMatchObject({
      id: "7",
      mediaUrl: "https://x/c.mp4",
      mediaType: "video",
      viewCount: 0,
      viewedByMe: false,
    });
    expect(s?.user.fullName).toBe("an");
  });
  it("mediaType tường minh được giữ, không bị suy ra lại", () => {
    const s = normalizeStory({ id: "1", mediaUrl: "a.jpg", mediaType: "video" });
    expect(s?.mediaType).toBe("video");
  });
});

describe("normalizePoll", () => {
  it("null -> null", () => {
    expect(normalizePoll(null)).toBeNull();
    expect(normalizePoll(42)).toBeNull();
  });
  it("totalVotes tự tính từ options khi thiếu", () => {
    const p = normalizePoll({
      id: "p1",
      question: "Chọn?",
      options: [
        { id: 1, text: "A", voteCount: 3 },
        { id: 2, text: "B", voteCount: 2 },
      ],
    });
    expect(p?.totalVotes).toBe(5);
    expect(p?.options[0].id).toBe("1");
    expect(p?.userVotedOptionIds).toEqual([]);
  });
  it("totalVotes có sẵn được giữ; userVotedOptionIds map sang string", () => {
    const p = normalizePoll({
      id: "p1",
      question: "Q",
      options: [],
      totalVotes: 99,
      userVotedOptionIds: [1, "2"],
    });
    expect(p?.totalVotes).toBe(99);
    expect(p?.userVotedOptionIds).toEqual(["1", "2"]);
  });
});

describe("normalizeGroup", () => {
  it("null -> null; mặc định privacy public, memberCount 0, myRole none", () => {
    expect(normalizeGroup(null)).toBeNull();
    expect(normalizeGroup({ id: 5, name: "Nhóm" })).toMatchObject({
      id: "5",
      name: "Nhóm",
      privacy: "public",
      memberCount: 0,
      myRole: "none",
      description: null,
      coverImage: null,
    });
  });
});

describe("normalizeGroupMember", () => {
  it("null / thiếu username -> null", () => {
    expect(normalizeGroupMember(null)).toBeNull();
    expect(normalizeGroupMember({ user: { id: "1" } })).toBeNull();
  });
  it("dạng phẳng (không có .user) vẫn normalize được, role mặc định member", () => {
    const m = normalizeGroupMember({ id: "u9", username: "binh" });
    expect(m).toMatchObject({
      user: { id: "u9", username: "binh", fullName: "binh" },
      role: "member",
    });
  });
});

describe("normalizeFollowUser", () => {
  it("thiếu id hoặc username -> null", () => {
    expect(normalizeFollowUser({ username: "a" })).toBeNull();
    expect(normalizeFollowUser({ id: "1" })).toBeNull();
    expect(normalizeFollowUser(null)).toBeNull();
  });
  it("id số -> string; fullName fallback username", () => {
    const u = normalizeFollowUser({ id: 42, username: "chi" });
    expect(u).toMatchObject({ id: "42", username: "chi", fullName: "chi" });
  });
});
