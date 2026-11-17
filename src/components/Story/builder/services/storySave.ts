import type { Story } from '../types';
import { createStory, updateStory } from './api';

/**
 * Lưu story lên backend MXH (POST/PUT /builder-stories, luôn là draft).
 * Trả về id server để caller đồng bộ lại story.id local (id local dạng
 * `story-<timestamp>-...` không tồn tại trên server; lần lưu sau phải dùng
 * id server, nếu không PUT sẽ 404).
 */
export async function saveStory(
  story: Story,
  isEditingExisting?: boolean
): Promise<{ success: boolean; id?: string; path?: string; error?: string }> {
  try {
    // If explicitly specified, use that; otherwise check if it has created_at from backend DB
    const isEdit = isEditingExisting !== undefined ? isEditingExisting : Boolean(story.created_at);
    const thumb = story.thumbnail_url || story.thumbnail;
    const payload = {
      ...story,
      thumbnail_url: thumb,
      thumbnail: thumb,
    };
    if (isEdit && story.id) {
      const saved = await updateStory(story.id, payload);
      return { success: true, id: saved.id };
    }
    const saved = await createStory(payload);
    return { success: true, id: saved.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
