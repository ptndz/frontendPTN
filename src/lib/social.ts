/**
 * P1 — API layer (REST) cho Stories / Polls / Groups / Hashtag / Mention.
 *
 * Mọi hàm đều normalize phòng thủ: backend có thể bọc response trong
 * { data } / { groups } / { posts } / { users } hoặc trả thẳng mảng.
 * Axios đã có baseURL + auth interceptor (src/plugins/axios.plugin.ts),
 * nên ở đây chỉ dùng đường dẫn tương đối như /search, /reports (P0).
 */
import axios from "axios";
import type {
  Group,
  GroupMember,
  MentionUser,
  PollData,
  PostWithExtras,
  Story,
  StoryFeedGroup,
} from "../types/social";

const isRecord = (v: unknown): v is Record<string, any> =>
  typeof v === "object" && v !== null;

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Lấy mảng từ payload: trả thẳng mảng, hoặc nằm trong .data/.items/.<key>. */
function pickArray(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key] as unknown[];
  }
  if (Array.isArray(payload.data)) return payload.data as unknown[];
  return [];
}

function toStringId(v: unknown): string {
  return v == null ? "" : String(v);
}

export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  if (/\.(mp4|webm|mov|m4v|ogv)$/.test(clean)) return true;
  // Một số URL upload không có đuôi file — backend có thể trả kèm /video/.
  return clean.includes("/video/");
}

/** Tách media của bài viết thành { videos, images } để render riêng. */
export function partitionMedia(urls: string[] | null | undefined): {
  videos: string[];
  images: string[];
} {
  const videos: string[] = [];
  const images: string[] = [];
  for (const url of urls ?? []) {
    if (typeof url !== "string" || !url) continue;
    if (isVideoUrl(url)) videos.push(url);
    else images.push(url);
  }
  return { videos, images };
}

// ---------------------------------------------------------------- Stories

export function normalizeStory(raw: unknown): Story | null {
  if (!isRecord(raw)) return null;
  const user = isRecord(raw.user)
    ? {
        id: toStringId(raw.user.id),
        username: String(raw.user.username ?? ""),
        fullName: String(raw.user.fullName ?? raw.user.username ?? ""),
        avatar:
          typeof raw.user.avatar === "string" ? raw.user.avatar : null,
      }
    : { id: "", username: "", fullName: "", avatar: null };
  // Builder story (GET /stories/feed, kind: "builder"): không có mediaUrl,
  // nội dung nằm trong document (slides + elements).
  if (raw.kind === "builder" && isRecord(raw.document)) {
    const thumbnail =
      typeof raw.document.thumbnail === "string"
        ? raw.document.thumbnail
        : "";
    return {
      id: toStringId(raw.id),
      user,
      mediaUrl: thumbnail,
      mediaType: "image",
      viewCount: typeof raw.viewCount === "number" ? raw.viewCount : 0,
      viewedByMe: raw.viewedByMe === true,
      createdAt: String(raw.createdAt ?? ""),
      expiresAt: String(raw.expiresAt ?? ""),
      kind: "builder",
      document: raw.document as Record<string, unknown>,
      status: typeof raw.status === "string" ? raw.status : undefined,
    };
  }
  const mediaUrl = String(raw.mediaUrl ?? raw.url ?? "");
  if (!mediaUrl) return null;
  return {
    id: toStringId(raw.id),
    user,
    mediaUrl,
    mediaType:
      typeof raw.mediaType === "string"
        ? raw.mediaType
        : isVideoUrl(mediaUrl)
          ? "video"
          : "image",
    viewCount: typeof raw.viewCount === "number" ? raw.viewCount : 0,
    viewedByMe: raw.viewedByMe === true,
    createdAt: String(raw.createdAt ?? ""),
    expiresAt: String(raw.expiresAt ?? ""),
    kind: "simple",
  };
}

export async function fetchStoryFeed(): Promise<StoryFeedGroup[]> {
  const res = await axios.get("/stories/feed");
  const rawGroups = pickArray(res.data, ["feed", "groups"]);
  const groups: StoryFeedGroup[] = [];
  for (const raw of rawGroups) {
    if (!isRecord(raw)) continue;
    const user = isRecord(raw.user)
      ? {
          id: toStringId(raw.user.id),
          username: String(raw.user.username ?? ""),
          fullName: String(raw.user.fullName ?? raw.user.username ?? ""),
          avatar:
            typeof raw.user.avatar === "string" ? raw.user.avatar : null,
        }
      : null;
    // Nhóm có thể là { user, stories } hoặc bản thân nó là 1 story lẻ.
    const rawStories = Array.isArray(raw.stories)
      ? raw.stories
      : normalizeStory(raw)
        ? [raw]
        : [];
    const stories = rawStories
      .map(normalizeStory)
      .filter((s): s is Story => s !== null);
    if (stories.length === 0) continue;
    groups.push({
      user: user ?? stories[0].user,
      stories,
    });
  }
  return groups;
}

export async function createStory(input: {
  mediaUrl: string;
  mediaType: "image" | "video";
}): Promise<Story | null> {
  const res = await axios.post("/stories", input);
  const payload = res.data ?? {};
  const raw = isRecord(payload.story)
    ? payload.story
    : isRecord(payload.data)
      ? payload.data
      : payload;
  return normalizeStory(raw);
}

export async function viewStory(id: string): Promise<void> {
  await axios.post(`/stories/${id}/view`);
}

/** +1 lượt xem cho builder story đã publish (POST /builder-stories/:id/view). */
export async function viewBuilderStory(id: string): Promise<void> {
  await axios.post(`/builder-stories/${id}/view`);
}

export async function deleteStory(id: string): Promise<void> {
  await axios.delete(`/stories/${id}`);
}

// ------------------------------------------------------------------ Polls

export function normalizePoll(raw: unknown): PollData | null {
  if (!isRecord(raw)) return null;
  const options = asArray(raw.options).map((o) => {
    const r = isRecord(o) ? o : {};
    return {
      id: toStringId(r.id),
      text: String(r.text ?? ""),
      voteCount: typeof r.voteCount === "number" ? r.voteCount : 0,
    };
  });
  return {
    id: toStringId(raw.id),
    question: String(raw.question ?? ""),
    options,
    totalVotes:
      typeof raw.totalVotes === "number"
        ? raw.totalVotes
        : options.reduce((sum, o) => sum + o.voteCount, 0),
    userVotedOptionIds: asArray(raw.userVotedOptionIds).map(toStringId),
    multiple: typeof raw.multiple === "boolean" ? raw.multiple : undefined,
  };
}

export async function votePoll(
  pollId: string,
  optionIds: string[]
): Promise<PollData | null> {
  const res = await axios.post(`/polls/${pollId}/vote`, { optionIds });
  const payload = res.data ?? {};
  const raw = isRecord(payload.poll)
    ? payload.poll
    : isRecord(payload.data)
      ? payload.data
      : payload;
  // Một số backend chỉ trả { success } — khi đó caller tự GET lại.
  if (isRecord(raw) && (raw.question || raw.options)) {
    return normalizePoll(raw);
  }
  return fetchPoll(pollId);
}

export async function fetchPoll(pollId: string): Promise<PollData | null> {
  const res = await axios.get(`/polls/${pollId}`);
  const payload = res.data ?? {};
  const raw = isRecord(payload.poll)
    ? payload.poll
    : isRecord(payload.data)
      ? payload.data
      : payload;
  return normalizePoll(raw);
}

// ----------------------------------------------------------------- Groups

export function normalizeGroup(raw: unknown): Group | null {
  if (!isRecord(raw)) return null;
  return {
    id: toStringId(raw.id),
    name: String(raw.name ?? ""),
    description:
      typeof raw.description === "string" ? raw.description : null,
    privacy:
      typeof raw.privacy === "string" ? raw.privacy : "public",
    coverImage:
      typeof raw.coverImage === "string" ? raw.coverImage : null,
    memberCount:
      typeof raw.memberCount === "number" ? raw.memberCount : 0,
    myRole: typeof raw.myRole === "string" ? raw.myRole : "none",
    createdAt: String(raw.createdAt ?? ""),
  };
}

export async function fetchGroups(opts: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ groups: Group[]; total: number }> {
  const res = await axios.get("/groups", {
    params: { q: opts.q || undefined, page: opts.page ?? 1, limit: opts.limit ?? 20 },
  });
  const payload = res.data ?? {};
  const groups = pickArray(payload, ["groups"])
    .map(normalizeGroup)
    .filter((g): g is Group => g !== null);
  const total =
    typeof payload.total === "number" ? payload.total : groups.length;
  return { groups, total };
}

export async function fetchGroup(id: string): Promise<Group | null> {
  const res = await axios.get(`/groups/${id}`);
  const payload = res.data ?? {};
  const raw = isRecord(payload.group)
    ? payload.group
    : isRecord(payload.data)
      ? payload.data
      : payload;
  return normalizeGroup(raw);
}

export async function createGroup(input: {
  name: string;
  description: string;
  privacy: string;
}): Promise<Group | null> {
  const res = await axios.post("/groups", input);
  const payload = res.data ?? {};
  const raw = isRecord(payload.group)
    ? payload.group
    : isRecord(payload.data)
      ? payload.data
      : payload;
  return normalizeGroup(raw);
}

export async function joinGroup(id: string): Promise<void> {
  await axios.post(`/groups/${id}/join`);
}

export async function leaveGroup(id: string): Promise<void> {
  await axios.post(`/groups/${id}/leave`);
}

export function normalizeGroupMember(raw: unknown): GroupMember | null {
  if (!isRecord(raw)) return null;
  const userRaw = isRecord(raw.user) ? raw.user : raw;
  if (!isRecord(userRaw) || userRaw.username == null) return null;
  return {
    user: {
      id: toStringId(userRaw.id),
      username: String(userRaw.username ?? ""),
      fullName: String(userRaw.fullName ?? userRaw.username ?? ""),
      avatar:
        typeof userRaw.avatar === "string" ? userRaw.avatar : null,
    },
    role: typeof raw.role === "string" ? raw.role : "member",
    status: typeof raw.status === "string" ? raw.status : undefined,
  };
}

export async function fetchGroupMembers(id: string): Promise<GroupMember[]> {
  const res = await axios.get(`/groups/${id}/members`);
  return pickArray(res.data, ["members"])
    .map(normalizeGroupMember)
    .filter((m): m is GroupMember => m !== null);
}

export async function approveGroupMember(
  groupId: string,
  userId: string
): Promise<void> {
  await axios.post(`/groups/${groupId}/members/${userId}/approve`);
}

export async function removeGroupMember(
  groupId: string,
  userId: string
): Promise<void> {
  await axios.post(`/groups/${groupId}/members/${userId}/remove`);
}

export async function fetchGroupPosts(
  groupId: string,
  page = 1,
  limit = 20
): Promise<PostWithExtras[]> {
  const res = await axios.get(`/groups/${groupId}/posts`, {
    params: { page, limit },
  });
  const raw = pickArray(res.data, ["posts"]);
  return raw.filter(isRecord) as PostWithExtras[];
}

// ------------------------------------------------------- Hashtag / Mention

export async function fetchHashtagPosts(
  tag: string,
  page = 1,
  limit = 20
): Promise<{ posts: PostWithExtras[]; total: number }> {
  const res = await axios.get(
    `/hashtags/${encodeURIComponent(tag)}/posts`,
    { params: { page, limit } }
  );
  const payload = res.data ?? {};
  const posts = pickArray(payload, ["posts"]).filter(
    isRecord
  ) as PostWithExtras[];
  const total =
    typeof payload.total === "number" ? payload.total : posts.length;
  return { posts, total };
}

/** Gợi ý mention: GET /user/search?keyword= (đã có từ P0, dùng trong chat). */
export async function searchUsersForMention(
  keyword: string
): Promise<MentionUser[]> {
  const res = await axios.get("/user/search", { params: { keyword } });
  const payload = res.data ?? {};
  return pickArray(payload, ["users"])
    .filter(isRecord)
    .map((u) => ({
      id: toStringId((u as Record<string, any>).id),
      username: String((u as Record<string, any>).username ?? ""),
      fullName: String(
        (u as Record<string, any>).fullName ??
          (u as Record<string, any>).username ??
          ""
      ),
      avatar:
        typeof (u as Record<string, any>).avatar === "string"
          ? ((u as Record<string, any>).avatar as string)
          : null,
    }))
    .filter((u) => u.username !== "");
}

// ----------------------------------------------------------------- Follow
// P4.1 — Follow một chiều. Backend: POST /users/:id/follow|unfollow,
// GET /users/:id/followers|following|follow-status, GET /posts/following.

export interface FollowStatus {
  following: boolean;
  followedBy: boolean;
  followerCount: number;
  followingCount: number;
}

export interface FollowUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string | null;
  verified?: boolean;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export function normalizeFollowUser(raw: unknown): FollowUser | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.id !== "string" && typeof raw.id !== "number") return null;
  if (typeof raw.username !== "string") return null;
  return {
    id: toStringId(raw.id),
    username: raw.username,
    fullName: String(raw.fullName ?? raw.username ?? ""),
    avatar: typeof raw.avatar === "string" ? raw.avatar : null,
    verified: raw.verified === true,
    followerCount:
      typeof raw.followerCount === "number" ? raw.followerCount : undefined,
    followingCount:
      typeof raw.followingCount === "number"
        ? raw.followingCount
        : undefined,
    isFollowing: raw.isFollowing === true,
  };
}

function normalizeFollowStatus(payload: unknown): FollowStatus {
  const p = isRecord(payload) ? payload : {};
  return {
    following: p.following === true,
    followedBy: p.followedBy === true,
    followerCount:
      typeof p.followerCount === "number" ? p.followerCount : 0,
    followingCount:
      typeof p.followingCount === "number" ? p.followingCount : 0,
  };
}

export async function fetchFollowStatus(
  userId: string
): Promise<FollowStatus> {
  const res = await axios.get(`/users/${userId}/follow-status`);
  return normalizeFollowStatus(res.data ?? {});
}

export async function followUser(userId: string): Promise<FollowStatus> {
  const res = await axios.post(`/users/${userId}/follow`);
  return normalizeFollowStatus(res.data ?? {});
}

export async function unfollowUser(userId: string): Promise<FollowStatus> {
  const res = await axios.post(`/users/${userId}/unfollow`);
  return normalizeFollowStatus(res.data ?? {});
}

export async function fetchFollowers(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ users: FollowUser[]; total: number }> {
  const res = await axios.get(`/users/${userId}/followers`, {
    params: { page, limit },
  });
  const payload = res.data ?? {};
  const users = pickArray(payload, ["users"])
    .map(normalizeFollowUser)
    .filter((u): u is FollowUser => u !== null);
  return {
    users,
    total: typeof payload.total === "number" ? payload.total : users.length,
  };
}

export async function fetchFollowing(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ users: FollowUser[]; total: number }> {
  const res = await axios.get(`/users/${userId}/following`, {
    params: { page, limit },
  });
  const payload = res.data ?? {};
  const users = pickArray(payload, ["users"])
    .map(normalizeFollowUser)
    .filter((u): u is FollowUser => u !== null);
  return {
    users,
    total: typeof payload.total === "number" ? payload.total : users.length,
  };
}

/** Feed "Đang theo dõi": bài của user mình follow + bài của chính mình. */
export async function fetchFollowingPosts(
  page = 1,
  limit = 20
): Promise<{ posts: PostWithExtras[]; total: number; page: number }> {
  const res = await axios.get("/posts/following", {
    params: { page, limit },
  });
  const payload = res.data ?? {};
  const posts = pickArray(payload, ["posts"]).filter(
    isRecord
  ) as PostWithExtras[];
  return {
    posts,
    total: typeof payload.total === "number" ? payload.total : posts.length,
    page: typeof payload.page === "number" ? payload.page : page,
  };
}

// ---------------------------------------------------------------- Explore
// P4.2 — GET /explore/trending ->
// { trendingHashtags: [{ tag, postCount }],
//   trendingPosts: [IPost + poll],
//   suggestedUsers: [publicUser] }.

export interface TrendingHashtag {
  tag: string;
  postCount: number;
}

export interface ExploreTrending {
  trendingHashtags: TrendingHashtag[];
  trendingPosts: PostWithExtras[];
  suggestedUsers: FollowUser[];
}

export async function fetchExploreTrending(): Promise<ExploreTrending> {
  const res = await axios.get("/explore/trending");
  const payload = res.data ?? {};
  const trendingHashtags = pickArray(payload, ["trendingHashtags"])
    .filter(isRecord)
    .map((r) => ({
      tag: String((r as Record<string, any>).tag ?? ""),
      postCount:
        typeof (r as Record<string, any>).postCount === "number"
          ? ((r as Record<string, any>).postCount as number)
          : 0,
    }))
    .filter((h) => h.tag !== "");
  const trendingPosts = pickArray(payload, ["trendingPosts"]).filter(
    isRecord
  ) as PostWithExtras[];
  const suggestedUsers = pickArray(payload, ["suggestedUsers"])
    .map(normalizeFollowUser)
    .filter((u): u is FollowUser => u !== null);
  return { trendingHashtags, trendingPosts, suggestedUsers };
}
