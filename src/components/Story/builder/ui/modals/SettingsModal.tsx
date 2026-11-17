import React from 'react';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import type { Story } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story;
  onUpdateStory: (updates: Partial<Story>) => void;
}

export function SettingsModal({ isOpen, onClose, story, onUpdateStory }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80">
      <div className="bg-surface rounded-xl shadow-2xl w-[420px] max-h-[90vh] overflow-y-auto border border-line">
        <div className="flex items-center justify-between px-4 py-3 border-b border-line sticky top-0 bg-surface z-10">
          <h3 className="font-semibold text-ink">Cài đặt story</h3>
          <button onClick={onClose} className="p-1 hover:bg-line rounded transition-colors text-ink">
            ✕
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Thumbnail */}
          <div className="space-y-2">
            <label className="block text-sm text-ink">Ảnh đại diện / Ảnh bìa</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={story.thumbnail || story.thumbnail_url || ''}
                onChange={(e) => onUpdateStory({ thumbnail: e.target.value, thumbnail_url: e.target.value })}
                placeholder="Nhập liên kết ảnh hoặc tải lên..."
                className="flex-1 bg-line border border-line rounded px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent"
              />
              <label className="px-3 py-2 bg-line hover:bg-line rounded cursor-pointer text-sm text-ink transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = event.target?.result as string;
                        onUpdateStory({ thumbnail: base64, thumbnail_url: base64 });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                Upload
              </label>
            </div>
            {(story.thumbnail || story.thumbnail_url) && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-line">
                <img src={resolveMediaUrl(story.thumbnail || story.thumbnail_url)} alt="Thumbnail preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => onUpdateStory({ thumbnail: undefined, thumbnail_url: undefined })}
                  className="absolute top-1 right-1 p-1 bg-ink/60 hover:bg-danger rounded text-ink text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <label className="block text-sm text-ink">Mô tả</label>
            <textarea
              value={story.description || ''}
              onChange={(e) => onUpdateStory({ description: e.target.value })}
              placeholder="Nhập mô tả story..."
              rows={3}
              className="w-full bg-line border border-line rounded px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Cài đặt story */}
          <div className="border-t border-line pt-4 space-y-4">
            <h4 className="text-sm font-medium text-ink">Phát lại</h4>
            <label className="flex items-center justify-between">
              <span className="text-sm text-ink">Tự chuyển slide</span>
              <input
                type="checkbox"
                checked={story.settings?.autoAdvance ?? true}
                onChange={(e) =>
                  onUpdateStory({ settings: { ...story.settings!, autoAdvance: e.target.checked } })
                }
                className="w-4 h-4 accent-accent"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-ink">Lặp lại story</span>
              <input
                type="checkbox"
                checked={story.settings?.loop ?? false}
                onChange={(e) =>
                  onUpdateStory({ settings: { ...story.settings!, loop: e.target.checked } })
                }
                className="w-4 h-4 accent-accent"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-ink">Hiện thanh tiến trình</span>
              <input
                type="checkbox"
                checked={story.settings?.showProgressBar ?? true}
                onChange={(e) =>
                  onUpdateStory({ settings: { ...story.settings!, showProgressBar: e.target.checked } })
                }
                className="w-4 h-4 accent-accent"
              />
            </label>
          </div>
        </div>
        <div className="px-4 py-3 border-t border-line flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent hover:bg-accent rounded-lg text-sm font-medium transition-colors text-accent-ink"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
