/**
 * MXH API shim cho story builder — thay thế `~/services/api` của botbanhang.
 *
 * Botbanhang gọi `/api/admin/stories*` (không tồn tại trong MXH).
 * File này map đúng các hàm builder dùng sang backend MXH mới
 * (xem ~/workspace/loadtest/story-builder/API_CONTRACT.md):
 *   stories  -> REST /builder-stories (BuilderStory, document JSON)
 *   upload   -> POST /image có sẵn (cùng flow StoryRow / CreatePost)
 *
 * Tính năng shop (catalog/giỏ hàng/checkout, nút mua hàng)
 * đã bị xóa khỏi builder — MXH không có shop.
 *
 * Kiểu `Story` của builder (botbanhang) được giữ nguyên làm document type;
 * backend lưu nguyên document dưới dạng JSON.
 */
import axios from "axios";
import type { Story } from "../types";
import { uploadMediaLocally } from "../utils/media";

export interface BuilderStoryApiItem {
  kind: "builder";
  id: string;
  user?: Record<string, unknown>;
  status: "draft" | "published" | "archived";
  document: Record<string, unknown>;
  viewCount: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Map status server -> status builder. Builder dùng 'active' cho story đang
 * hiển thị (filter/stats của StoriesManager), server dùng 'published'
 * (API_CONTRACT §7: map 'active' -> 'published').
 */
function mapStatusFromServer(
  status: string | undefined
): Story["status"] {
  if (status === "published") return "active";
  if (status === "archived") return "archived";
  return "draft";
}

/** API story -> builder Story (document + id/status server). */
export function toBuilderStory(raw: unknown): Story {
  const r = (raw ?? {}) as Partial<BuilderStoryApiItem> & Record<string, unknown>;
  const document = (r.document ?? {}) as Partial<Story> & Record<string, unknown>;
  return {
    ...(document as Story),
    id: String(r.id ?? document.id ?? ""),
    status: mapStatusFromServer(r.status as string | undefined),
    createdAt: String(r.createdAt ?? document.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? document.updatedAt ?? ""),
    thumbnail:
      (document.thumbnail as string | undefined) ??
      (document.thumbnail_url as string | undefined),
    view_count:
      typeof r.viewCount === "number" ? r.viewCount : document.view_count,
  };
}

/** Builder Story -> document gửi backend (bỏ field do server làm chủ). */
function toDocument(story: Partial<Story> & Record<string, unknown>): Record<string, unknown> {
  const { status: _status, ...rest } = story as Record<string, unknown>;
  void _status;
  return rest;
}

function pickStory(payload: unknown): Story {
  const p = (payload ?? {}) as Record<string, unknown>;
  const raw = (p.story ?? p) as unknown;
  return toBuilderStory(raw);
}

export async function getAdminStories(
  status?: "all" | "active" | "draft" | "archived"
): Promise<{ items: Story[]; total: number }> {
  const params: Record<string, string> = {};
  // 'active' (builder) == 'published' (server); 'archived'/'draft' giữ nguyên.
  if (status === "active") params.status = "published";
  else if (status === "draft" || status === "archived") params.status = status;
  const res = await axios.get("/builder-stories/mine", { params });
  const payload = res.data ?? {};
  const items = Array.isArray(payload.stories) ? payload.stories : [];
  return { items: items.map(toBuilderStory), total: items.length };
}

export async function getBuilderStory(id: string): Promise<Story> {
  const res = await axios.get(`/builder-stories/${id}`);
  return pickStory(res.data);
}

export async function createStory(
  payload: Partial<Story> & Record<string, unknown>
): Promise<Story> {
  const res = await axios.post("/builder-stories", {
    document: toDocument(payload),
  });
  return pickStory(res.data);
}

export async function updateStory(
  id: string,
  payload: Partial<Story> & Record<string, unknown>
): Promise<Story> {
  const res = await axios.put(`/builder-stories/${id}`, {
    document: toDocument(payload),
  });
  return pickStory(res.data);
}

export async function deleteStory(id: string): Promise<void> {
  await axios.delete(`/builder-stories/${id}`);
}

export async function duplicateBuilderStory(id: string): Promise<Story> {
  const res = await axios.post(`/builder-stories/${id}/duplicate`);
  return pickStory(res.data);
}

export async function publishBuilderStory(id: string): Promise<Story> {
  const res = await axios.post(`/builder-stories/${id}/publish`);
  return pickStory(res.data);
}

export async function archiveBuilderStory(id: string): Promise<Story> {
  const res = await axios.post(`/builder-stories/${id}/archive`);
  return pickStory(res.data);
}

export async function uploadStoryMedia(file: File): Promise<string> {
  return uploadMediaLocally(file);
}
