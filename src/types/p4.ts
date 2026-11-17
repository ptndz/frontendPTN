/**
 * P4.3 — Types dùng chung cho Events / Pages / Marketplace.
 *
 * API contract (backend REST, xem src/services/p4.ts bên express-example):
 *   Events:     POST /events; GET /events?q&upcoming&page&limit;
 *               GET /events/:id; PUT /events/:id; DELETE /events/:id;
 *               POST /events/:id/attend {status}; GET /events/:id/attendees
 *   Pages:      POST /pages; GET /pages?q&category&page&limit; GET /pages/:id;
 *               PUT /pages/:id; DELETE /pages/:id;
 *               POST /pages/:id/follow|unfollow
 *   Marketplace: POST /listings; GET /listings?q&minPrice&maxPrice&location&page&limit;
 *               GET /listings/:id; PUT /listings/:id;
 *               POST /listings/:id/sold|remove
 * Mọi response đều bọc { code, success, ... } ở top-level (không có .data).
 */
import type { StoryUser } from "./social";

export type AttendStatus = "going" | "interested" | "not-going";

export interface P4Event {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: string;
  endsAt?: string | null;
  coverImage?: string | null;
  creator?: StoryUser | null;
  creatorId?: string | null;
  goingCount: number;
  interestedCount: number;
  notGoingCount: number;
  myStatus: AttendStatus | string | null;
  createdAt: string;
}

export interface EventAttendee {
  id: string;
  user: StoryUser;
  status: AttendStatus | string;
  createdAt: string;
}

export interface P4Page {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  coverImage?: string | null;
  owner?: StoryUser | null;
  ownerId?: string | null;
  followerCount: number;
  isFollowing: boolean;
  createdAt: string;
}

export type ListingStatus = "active" | "sold" | "removed";

export interface P4Listing {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  currency: string;
  images: string[];
  location?: string | null;
  seller?: StoryUser | null;
  sellerId?: string | null;
  status: ListingStatus | string;
  createdAt: string;
}

/** Định dạng giá theo locale vi-VN (VND mặc định, không hardcode ký hiệu). */
export function formatPrice(price: number, currency = "VND"): string {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(price);
  } catch {
    return `${price.toLocaleString("vi-VN")} ${currency || "VND"}`;
  }
}

/** Định dạng ngày giờ sự kiện theo locale vi-VN. */
export function formatEventDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
