import axios from "axios";
import {
  dictionaries,
  interpolate,
  type Locale,
} from "../i18n/dictionaries";

/**
 * P0.1 — Notification API layer.
 *
 * Contract (backend P0.1):
 *   GET  /notification/all?page&limit&filter=all|unread
 *        -> { data, total, unreadCount }
 *   GET  /notification/unread-count -> { unreadCount }
 *   POST /notification/:id/read
 *   POST /notification/read-all
 *   Notification: { id, type, actorId, actor { id, fullName, avatar },
 *                   postId?, conversationId?, read, createdAt }
 *
 * DISCREPANCY vs the old frontend call site (Navigation.tsx, before P0.1):
 * the old code called GET /notification/all expecting
 *   { notifications: [{ id, isRead, notification: { content, createAt, senderID, url } }] }
 * and marked read via POST /notification/read/:id, checking res.data.status.
 * Neither the old shape nor the old endpoint ever existed on the backend
 * (the backend only had POST /notification/subscription), so the old
 * dropdown could never show real data. This module speaks the contract
 * first and normalizes the legacy envelope/shape when it shows up, so the
 * UI works against either response.
 */

export type NotificationType =
  | "like"
  | "comment"
  | "friend_request"
  | "message"
  | "mention"
  | "follow"
  | "group_invite"
  | "warn"
  | "general";

export interface NotificationActor {
  id: string;
  fullName: string;
  avatar?: string | null;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  actorId?: string;
  actor?: NotificationActor | null;
  postId?: string;
  conversationId?: string;
  read: boolean;
  createdAt: string;
  /** Legacy-only: pre-rendered text from the old nested shape. */
  content?: string;
  /** Legacy-only: absolute/relative URL the old shape carried. */
  url?: string;
}

export interface NotificationListResult {
  items: AppNotification[];
  total: number;
  unreadCount: number;
}

export type NotificationFilter = "all" | "unread";

const isRecord = (v: unknown): v is Record<string, any> =>
  typeof v === "object" && v !== null;

/** Normalize one raw item: contract shape, or the legacy nested shape. */
export function normalizeNotification(raw: unknown): AppNotification | null {
  if (!isRecord(raw)) return null;

  // Legacy shape: { id, isRead, notification: { content, createAt, senderID, url } }
  if (isRecord(raw.notification)) {
    const nested = raw.notification;
    return {
      id: String(raw.id),
      type: "general",
      actorId:
        typeof nested.senderID === "string" ? nested.senderID : undefined,
      actor: null,
      read: raw.isRead === true,
      createdAt: String(nested.createAt ?? raw.createdAt ?? ""),
      content:
        typeof nested.content === "string" ? nested.content : undefined,
      url: typeof nested.url === "string" ? nested.url : undefined,
    };
  }

  const type =
    typeof raw.type === "string" ? (raw.type as NotificationType) : "general";
  const actor = isRecord(raw.actor)
    ? {
        id: String(raw.actor.id ?? ""),
        fullName: String(raw.actor.fullName ?? ""),
        avatar:
          typeof raw.actor.avatar === "string" ? raw.actor.avatar : null,
      }
    : null;

  return {
    id: String(raw.id),
    type,
    actorId: raw.actorId != null ? String(raw.actorId) : undefined,
    actor,
    postId: raw.postId != null ? String(raw.postId) : undefined,
    conversationId:
      raw.conversationId != null ? String(raw.conversationId) : undefined,
    read: raw.read === true,
    createdAt: String(raw.createdAt ?? ""),
  };
}

/**
 * P5b — text thông báo theo locale; mặc định vi (khớp text cũ y hệt).
 * `n.content` (text backend gửi sẵn) vẫn được ưu tiên như trước.
 */
export function notificationText(
  n: AppNotification,
  locale: Locale = "vi"
): string {
  if (n.content) return n.content;
  const lib = dictionaries[locale].notifications.lib;
  const name = n.actor?.fullName || lib.someone;
  switch (n.type) {
    case "like":
      return interpolate(lib.like, { name });
    case "comment":
      return interpolate(lib.comment, { name });
    case "friend_request":
      return interpolate(lib.friendRequest, { name });
    case "message":
      return interpolate(lib.message, { name });
    case "mention":
      return interpolate(lib.mention, { name });
    case "follow":
      return interpolate(lib.follow, { name });
    case "group_invite":
      return interpolate(lib.groupInvite, { name });
    case "warn":
      return interpolate(lib.warn, { name });
    default:
      return interpolate(lib.other, { name });
  }
}

/** Where a click on the notification should go. */
export function notificationTarget(n: AppNotification): string | null {
  if (n.postId) return `/post/${n.postId}`;
  if (n.conversationId) return "/messenger";
  if (n.type === "friend_request") return "/friends";
  if (n.url) return n.url;
  return null;
}

export async function fetchNotifications(opts: {
  page?: number;
  limit?: number;
  filter?: NotificationFilter;
} = {}): Promise<NotificationListResult> {
  const { page = 1, limit = 20, filter = "all" } = opts;
  const res = await axios.get("/notification/all", {
    params: { page, limit, filter },
  });
  const payload = res.data ?? {};
  // Contract envelope { data, total, unreadCount } or legacy { notifications }.
  const rawItems: unknown[] = Array.isArray(payload.data)
    ? payload.data
    : Array.isArray(payload.notifications)
      ? payload.notifications
      : [];
  const items = rawItems
    .map(normalizeNotification)
    .filter((n): n is AppNotification => n !== null);
  const total =
    typeof payload.total === "number" ? payload.total : items.length;
  const unreadCount =
    typeof payload.unreadCount === "number"
      ? payload.unreadCount
      : items.filter((n) => !n.read).length;
  return { items, total, unreadCount };
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await axios.get("/notification/unread-count");
  if (typeof res.data?.unreadCount === "number") {
    return res.data.unreadCount;
  }
  throw new Error("unread-count: unexpected response shape");
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    // Contract endpoint.
    await axios.post(`/notification/${id}/read`);
  } catch (error: any) {
    // Legacy endpoint fallback (old frontend used /notification/read/:id).
    if (error?.response?.status === 404) {
      await axios.post(`/notification/read/${id}`);
      return;
    }
    throw error;
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  await axios.post("/notification/read-all");
}
