import type { Story } from '../types';
import {
  getAdminStories,
  deleteStory as apiDeleteStory,
  duplicateBuilderStory,
} from './api';

export interface StoredStory {
  id: string;
  story: Story;
  lastModified: string;
  thumbnail?: string;
  source?: 'local' | 'file' | 'github';
  path?: string;
  sha?: string;
}

export async function loadAllStories(): Promise<StoredStory[]> {
  try {
    const res = await getAdminStories();
    const items: Story[] = Array.isArray(res) ? res : (res as { items: Story[] }).items || [];
    return items.map((s: Story) => ({
      id: s.id,
      story: s,
      lastModified: s.updated_at || s.updatedAt || s.created_at || s.createdAt || new Date().toISOString(),
      thumbnail: s.thumbnail || s.thumbnail_url,
      source: 'local',
    }));
  } catch (error) {
    console.error('Failed to load stories:', error);
    return [];
  }
}

export async function deleteStory(story: StoredStory): Promise<void> {
  await apiDeleteStory(story.id);
}

/**
 * MXH: nhân bản qua POST /builder-stories/:id/duplicate (server sinh id
 * slide/element mới, title + " (bản sao)"). Botbanhang gốc chỉ copy local
 * mà không lưu — bản MXH lưu thật rồi mới trả về.
 */
export async function duplicateStory(story: StoredStory): Promise<Story> {
  return duplicateBuilderStory(story.id);
}

export function exportStoryAsJSON(story: Story): void {
  const dataStr = JSON.stringify(story, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${story.title.replace(/\s+/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
