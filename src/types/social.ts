/**
 * P1 — Types dùng chung cho Stories / Polls / Groups / Hashtag / Mention.
 *
 * Các shape bám đúng API contract P1 (backend xây song song):
 *   Stories:  POST /stories {mediaUrl, mediaType}; GET /stories/feed;
 *             POST /stories/:id/view; DELETE /stories/:id
 *   Polls:    POST /polls/:id/vote {optionIds}; GET /polls/:id
 *   Groups:   POST /groups; GET /groups?q&page&limit; GET /groups/:id;
 *             POST /groups/:id/join|leave; GET /groups/:id/members;
 *             POST /groups/:id/members/:userId/approve|remove;
 *             GET /groups/:id/posts
 *   Hashtag:  GET /hashtags/:tag/posts
 *   Mention:  GET /user/search?keyword=
 */
import type { IComment, ILike, IPost } from "../gql/graphql";

export type Audience = "public" | "friends" | "only-me";

export const AUDIENCE_OPTIONS: { value: Audience; label: string }[] = [
  { value: "public", label: "Công khai" },
  { value: "friends", label: "Bạn bè" },
  { value: "only-me", label: "Chỉ mình tôi" },
];

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

export interface PollData {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionIds: string[];
  /** Backend có thể không trả field này — chỉ dùng khi có. */
  multiple?: boolean;
}

/**
 * Bài viết kèm các field P1 (poll/audience) — đều optional để bài cũ vẫn render.
 *
 * W6: schema GraphQL khai báo comments/likes/images là mảng nullable
 * ([IComment], [String] — phần tử có thể null), nhưng toàn bộ UI (đặc
 * biệt SinglePost) vốn giả định các phần tử non-null. Thu hẹp 3 field này
 * về mảng non-null để type khớp với giả định đó; dữ liệu thô từ GraphQL
 * (IPost) vào đây phải qua cast `as PostWithExtras` ở call site (xem
 * Bookmarked, pages/post/[uuid], pages/search) vì IPost giữ nguyên
 * nullability của schema.
 */
export type PostWithExtras = Omit<IPost, "comments" | "likes" | "images"> & {
  // W6: IPost.audience là Maybe<string> (backend cho null) nên phải nhận null,
  // nếu không IPost không gán được cho PostWithExtras.
  audience?: Audience | string | null;
  poll?: PollData | null;
  groupId?: string | null;
  comments?: IComment[] | null;
  likes?: ILike[] | null;
  images?: string[] | null;
};

export interface StoryUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string | null;
}

export interface Story {
  id: string;
  user: StoryUser;
  mediaUrl: string;
  mediaType: "image" | "video" | string;
  viewCount: number;
  viewedByMe: boolean;
  createdAt: string;
  expiresAt: string;
  /**
   * Loại story: "simple" (ảnh/video/tin chữ cũ) hoặc "builder" (tin thiết
   * kế từ Story Studio, render từ `document`). Mặc định "simple".
   */
  kind?: "simple" | "builder";
  /** Toàn bộ document builder (slides + elements), chỉ có khi kind = "builder". */
  document?: Record<string, unknown> | null;
  status?: string;
}

export interface StoryFeedGroup {
  user: StoryUser;
  stories: Story[];
}

export type GroupPrivacy = "public" | "private";
export type GroupRole = "admin" | "member" | "pending" | "none";

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  privacy: GroupPrivacy | string;
  coverImage?: string | null;
  memberCount: number;
  myRole: GroupRole | string;
  createdAt: string;
}

export interface GroupMember {
  user: StoryUser;
  role: string;
  /** 'member' | 'pending' — backend có thể không trả thì coi là member. */
  status?: string;
}

export interface MentionUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string | null;
}
