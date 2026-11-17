/**
 * Media upload cho story builder — thay cho `~/utils/media` của botbanhang.
 *
 * Botbanhang: uploadMediaLocally() chỉ là wrapper của uploadStoryMedia()
 * (POST /api/admin/stories/upload). MXH không có endpoint đó — upload qua
 * POST /image có sẵn (cùng flow với StoryRow / CreatePost), trả về URL.
 */
import axios from "axios";

export type MediaType = "image" | "video" | "audio";

export async function uploadMediaLocally(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("images", file);
  const res = await axios.post("/image", formData);
  const urls: string[] = res.data?.images ?? [];
  const url = urls[0];
  if (!url) throw new Error("Upload failed: no URL returned from /image");
  return url;
}

export function getPendingMedia(): unknown[] {
  return [];
}

export function clearPendingMedia(): void {}

export function removePendingMedia(_id: string): void {}

export async function uploadAllPendingMedia(
  _onProgress?: (
    current: number,
    total: number,
    fileName: string,
    type: MediaType
  ) => void
): Promise<void> {}
