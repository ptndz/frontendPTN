/**
 * P4.3 — API layer (REST) cho Events / Pages / Marketplace.
 * Axios đã có baseURL + auth interceptor (src/plugins/axios.plugin.ts),
 * nên ở đây chỉ dùng đường dẫn tương đối. Response backend bọc ở
 * top-level: { code, success, events/pages/listings, page, limit, total }
 * (không có .data) — khác một số endpoint P0/P1 nên không dùng chung
 * pickArray của lib/social.ts mà normalize riêng, phòng thủ.
 */
import axios from "axios";
import type {
  AttendStatus,
  EventAttendee,
  P4Event,
  P4Listing,
  P4Page,
} from "../types/p4";

const isRecord = (v: unknown): v is Record<string, any> =>
  typeof v === "object" && v !== null;

const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

function toStringId(v: unknown): string {
  return v == null ? "" : String(v);
}

function toUser(raw: unknown): {
  id: string;
  username: string;
  fullName: string;
  avatar?: string | null;
} {
  if (!isRecord(raw)) return { id: "", username: "", fullName: "", avatar: null };
  return {
    id: toStringId(raw.id),
    username: String(raw.username ?? ""),
    fullName: String(raw.fullName ?? raw.username ?? ""),
    avatar: typeof raw.avatar === "string" ? raw.avatar : null,
  };
}

/** Upload 1..n file qua POST /image (field "images") -> mảng URL. */
export async function uploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  for (const f of files) formData.append("images", f);
  const res = await axios.post("/image", formData);
  const urls = asArray((res.data as any)?.images).filter(
    (u): u is string => typeof u === "string" && !!u
  );
  return urls;
}

// ---------------------------------------------------------------- Events

export function normalizeEvent(raw: unknown): P4Event | null {
  if (!isRecord(raw)) return null;
  return {
    id: toStringId(raw.id),
    title: String(raw.title ?? ""),
    description: typeof raw.description === "string" ? raw.description : null,
    location: typeof raw.location === "string" ? raw.location : null,
    startsAt: String(raw.startsAt ?? ""),
    endsAt: typeof raw.endsAt === "string" ? raw.endsAt : null,
    coverImage: typeof raw.coverImage === "string" ? raw.coverImage : null,
    creator: isRecord(raw.creator) ? toUser(raw.creator) : null,
    creatorId:
      raw.creatorId != null
        ? toStringId(raw.creatorId)
        : isRecord(raw.creator)
          ? toStringId(raw.creator.id)
          : null,
    goingCount: typeof raw.goingCount === "number" ? raw.goingCount : 0,
    interestedCount:
      typeof raw.interestedCount === "number" ? raw.interestedCount : 0,
    notGoingCount:
      typeof raw.notGoingCount === "number" ? raw.notGoingCount : 0,
    myStatus:
      typeof raw.myStatus === "string" ? (raw.myStatus as AttendStatus) : null,
    createdAt: String(raw.createdAt ?? ""),
  };
}

export async function fetchEvents(params: {
  q?: string;
  upcoming?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ events: P4Event[]; total: number; page: number }> {
  const res = await axios.get("/events", {
    params: {
      q: params.q || undefined,
      upcoming: params.upcoming ? 1 : undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });
  const data = res.data as any;
  return {
    events: asArray(data?.events).map(normalizeEvent).filter(Boolean) as P4Event[],
    total: typeof data?.total === "number" ? data.total : 0,
    page: typeof data?.page === "number" ? data.page : (params.page ?? 1),
  };
}

export async function fetchEvent(id: string): Promise<P4Event | null> {
  const res = await axios.get(`/events/${id}`);
  return normalizeEvent((res.data as any)?.event);
}

export async function createEvent(body: {
  title: string;
  description?: string;
  location?: string;
  startsAt: string;
  endsAt?: string | null;
  coverImage?: string | null;
}): Promise<P4Event | null> {
  const res = await axios.post("/events", body);
  return normalizeEvent((res.data as any)?.event);
}

export async function updateEvent(
  id: string,
  body: Partial<{
    title: string;
    description: string | null;
    location: string | null;
    startsAt: string;
    endsAt: string | null;
    coverImage: string | null;
  }>
): Promise<P4Event | null> {
  const res = await axios.put(`/events/${id}`, body);
  return normalizeEvent((res.data as any)?.event);
}

export async function deleteEvent(id: string): Promise<void> {
  await axios.delete(`/events/${id}`);
}

export async function attendEvent(
  id: string,
  status: AttendStatus
): Promise<P4Event | null> {
  const res = await axios.post(`/events/${id}/attend`, { status });
  return normalizeEvent((res.data as any)?.event);
}

export function normalizeEventAttendee(raw: unknown): EventAttendee | null {
  if (!isRecord(raw)) return null;
  return {
    id: toStringId(raw.id),
    user: toUser(raw.user),
    status: typeof raw.status === "string" ? (raw.status as AttendStatus) : "going",
    createdAt: String(raw.createdAt ?? ""),
  };
}

export async function fetchEventAttendees(
  id: string
): Promise<{ attendees: EventAttendee[]; counts: { going: number; interested: number; notGoing: number } }> {
  const res = await axios.get(`/events/${id}/attendees`);
  const data = res.data as any;
  const counts = isRecord(data?.counts)
    ? {
        going: typeof data.counts.going === "number" ? data.counts.going : 0,
        interested:
          typeof data.counts.interested === "number" ? data.counts.interested : 0,
        notGoing:
          typeof data.counts.notGoing === "number" ? data.counts.notGoing : 0,
      }
    : { going: 0, interested: 0, notGoing: 0 };
  return {
    attendees: asArray(data?.attendees)
      .map(normalizeEventAttendee)
      .filter(Boolean) as EventAttendee[],
    counts,
  };
}

// ------------------------------------------------------------------ Pages

export function normalizePage(raw: unknown): P4Page | null {
  if (!isRecord(raw)) return null;
  return {
    id: toStringId(raw.id),
    name: String(raw.name ?? ""),
    description: typeof raw.description === "string" ? raw.description : null,
    category: typeof raw.category === "string" ? raw.category : null,
    coverImage: typeof raw.coverImage === "string" ? raw.coverImage : null,
    owner: isRecord(raw.owner) ? toUser(raw.owner) : null,
    ownerId:
      raw.ownerId != null
        ? toStringId(raw.ownerId)
        : isRecord(raw.owner)
          ? toStringId(raw.owner.id)
          : null,
    followerCount: typeof raw.followerCount === "number" ? raw.followerCount : 0,
    isFollowing: raw.isFollowing === true,
    createdAt: String(raw.createdAt ?? ""),
  };
}

export async function fetchPages(params: {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ pages: P4Page[]; total: number; page: number }> {
  const res = await axios.get("/pages", {
    params: {
      q: params.q || undefined,
      category: params.category || undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });
  const data = res.data as any;
  return {
    pages: asArray(data?.pages).map(normalizePage).filter(Boolean) as P4Page[],
    total: typeof data?.total === "number" ? data.total : 0,
    page: typeof data?.page === "number" ? data.page : (params.page ?? 1),
  };
}

export async function fetchPage(id: string): Promise<P4Page | null> {
  const res = await axios.get(`/pages/${id}`);
  return normalizePage((res.data as any)?.page);
}

export async function createPage(body: {
  name: string;
  description?: string;
  category?: string;
  coverImage?: string | null;
}): Promise<P4Page | null> {
  const res = await axios.post("/pages", body);
  return normalizePage((res.data as any)?.page);
}

export async function updatePage(
  id: string,
  body: Partial<{
    name: string;
    description: string | null;
    category: string | null;
    coverImage: string | null;
  }>
): Promise<P4Page | null> {
  const res = await axios.put(`/pages/${id}`, body);
  return normalizePage((res.data as any)?.page);
}

export async function deletePage(id: string): Promise<void> {
  await axios.delete(`/pages/${id}`);
}

export async function followPage(id: string): Promise<P4Page | null> {
  const res = await axios.post(`/pages/${id}/follow`);
  return normalizePage((res.data as any)?.page);
}

export async function unfollowPage(id: string): Promise<P4Page | null> {
  const res = await axios.post(`/pages/${id}/unfollow`);
  return normalizePage((res.data as any)?.page);
}

// -------------------------------------------------------------- Marketplace

export function normalizeListing(raw: unknown): P4Listing | null {
  if (!isRecord(raw)) return null;
  return {
    id: toStringId(raw.id),
    title: String(raw.title ?? ""),
    description: typeof raw.description === "string" ? raw.description : null,
    price: typeof raw.price === "number" ? raw.price : Number(raw.price) || 0,
    currency: typeof raw.currency === "string" ? raw.currency : "VND",
    images: asArray(raw.images).filter(
      (u): u is string => typeof u === "string" && !!u
    ),
    location: typeof raw.location === "string" ? raw.location : null,
    seller: isRecord(raw.seller) ? toUser(raw.seller) : null,
    sellerId:
      raw.sellerId != null
        ? toStringId(raw.sellerId)
        : isRecord(raw.seller)
          ? toStringId(raw.seller.id)
          : null,
    status: typeof raw.status === "string" ? raw.status : "active",
    createdAt: String(raw.createdAt ?? ""),
  };
}

export async function fetchListings(params: {
  q?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  location?: string;
  page?: number;
  limit?: number;
}): Promise<{ listings: P4Listing[]; total: number; page: number }> {
  const res = await axios.get("/listings", {
    params: {
      q: params.q || undefined,
      minPrice: params.minPrice ?? undefined,
      maxPrice: params.maxPrice ?? undefined,
      location: params.location || undefined,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    },
  });
  const data = res.data as any;
  return {
    listings: asArray(data?.listings)
      .map(normalizeListing)
      .filter(Boolean) as P4Listing[],
    total: typeof data?.total === "number" ? data.total : 0,
    page: typeof data?.page === "number" ? data.page : (params.page ?? 1),
  };
}

export async function fetchListing(id: string): Promise<P4Listing | null> {
  const res = await axios.get(`/listings/${id}`);
  return normalizeListing((res.data as any)?.listing);
}

export async function createListing(body: {
  title: string;
  description?: string;
  price: number;
  currency?: string;
  images?: string[];
  location?: string;
}): Promise<P4Listing | null> {
  const res = await axios.post("/listings", body);
  return normalizeListing((res.data as any)?.listing);
}

export async function updateListing(
  id: string,
  body: Partial<{
    title: string;
    description: string | null;
    price: number;
    currency: string;
    images: string[];
    location: string | null;
  }>
): Promise<P4Listing | null> {
  const res = await axios.put(`/listings/${id}`, body);
  return normalizeListing((res.data as any)?.listing);
}

export async function markListingSold(id: string): Promise<P4Listing | null> {
  const res = await axios.post(`/listings/${id}/sold`);
  return normalizeListing((res.data as any)?.listing);
}

export async function removeListing(id: string): Promise<P4Listing | null> {
  const res = await axios.post(`/listings/${id}/remove`);
  return normalizeListing((res.data as any)?.listing);
}
