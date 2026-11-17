/**
 * Export Settings Modal Component
 *
 * Provides UI for configuring video export settings including:
 * - Resolution (720p, 1080p, 4K)
 * - Frame rate (24, 30, 60 fps)
 * - Bitrate (2, 4, 8 Mbps)
 * - Export scope (current slide or all slides)
 *
 * Requirements: 5.1, 5.2, 5.3
 */

import { Film, X } from 'lucide-react';
import React, { useState } from 'react';

// ==========================================
// Types and Interfaces
// ==========================================

export type Resolution = '720p' | '1080p' | '4k';
export type FrameRate = 24 | 30 | 60;
export type Bitrate = 2_000_000 | 4_000_000 | 8_000_000;

export interface ExportSettings {
  resolution: Resolution;
  fps: FrameRate;
  bitrate: Bitrate;
  exportAllSlides: boolean;
  includeAudio: boolean;
}

export const RESOLUTION_MAP: Record<Resolution, { width: number; height: number; label: string }> = {
  '720p': { width: 720, height: 1280, label: '720p (720×1280)' },
  '1080p': { width: 1080, height: 1920, label: '1080p (1080×1920)' },
  '4k': { width: 2160, height: 3840, label: '4K (2160×3840)' },
};

export const FPS_OPTIONS: { value: FrameRate; label: string }[] = [
  { value: 24, label: '24 fps (Điện ảnh)' },
  { value: 30, label: '30 fps (Chuẩn)' },
  { value: 60, label: '60 fps (Mượt)' },
];

export const BITRATE_OPTIONS: { value: Bitrate; label: string }[] = [
  { value: 2_000_000, label: '2 Mbps (Tệp nhỏ)' },
  { value: 4_000_000, label: '4 Mbps (Cân bằng)' },
  { value: 8_000_000, label: '8 Mbps (Chất lượng cao)' },
];

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  resolution: '1080p',
  fps: 30,
  bitrate: 4_000_000,
  exportAllSlides: false,
  includeAudio: true,
};

// ==========================================
// Component Props
// ==========================================

interface ExportSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: ExportSettings) => void;
  slideCount: number;
  currentSlideIndex: number;
}

// ==========================================
// Component
// ==========================================

export function ExportSettingsModal({
  isOpen,
  onClose,
  onExport,
  slideCount,
  currentSlideIndex,
}: ExportSettingsModalProps) {
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(settings);
    onClose();
  };

  const estimatedSize = calculateEstimatedSize(settings, slideCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80">
      <div className="bg-surface rounded-xl shadow-2xl w-[480px] border border-line">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-line">
          <div className="flex items-center gap-2">
            <Film size={20} className="text-accent-bright" />
            <h3 className="font-semibold text-ink">Xuất video</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-line rounded transition-colors text-muted hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Resolution */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">Độ phân giải</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(RESOLUTION_MAP) as Resolution[]).map((res) => (
                <button
                  key={res}
                  onClick={() => setSettings((s) => ({ ...s, resolution: res }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.resolution === res
                      ? 'bg-accent text-accent-ink'
                      : 'bg-line text-ink hover:bg-line'
                  }`}
                >
                  {res.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted">{RESOLUTION_MAP[settings.resolution].label}</p>
          </div>

          {/* Frame Rate */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">Tốc độ khung hình</label>
            <div className="grid grid-cols-3 gap-2">
              {FPS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings((s) => ({ ...s, fps: option.value }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.fps === option.value
                      ? 'bg-accent text-accent-ink'
                      : 'bg-line text-ink hover:bg-line'
                  }`}
                >
                  {option.value} fps
                </button>
              ))}
            </div>
            <p className="text-xs text-muted">
              {FPS_OPTIONS.find((o) => o.value === settings.fps)?.label}
            </p>
          </div>

          {/* Bitrate */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">Chất lượng (Bitrate)</label>
            <div className="grid grid-cols-3 gap-2">
              {BITRATE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSettings((s) => ({ ...s, bitrate: option.value }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.bitrate === option.value
                      ? 'bg-accent text-accent-ink'
                      : 'bg-line text-ink hover:bg-line'
                  }`}
                >
                  {option.value / 1_000_000} Mbps
                </button>
              ))}
            </div>
            <p className="text-xs text-muted">
              {BITRATE_OPTIONS.find((o) => o.value === settings.bitrate)?.label}
            </p>
          </div>

          {/* Phạm vi xuất */}
          {slideCount > 1 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">Phạm vi xuất</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSettings((s) => ({ ...s, exportAllSlides: false }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !settings.exportAllSlides
                      ? 'bg-accent text-accent-ink'
                      : 'bg-line text-ink hover:bg-line'
                  }`}
                >
                  Slide hiện tại
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, exportAllSlides: true }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    settings.exportAllSlides
                      ? 'bg-accent text-accent-ink'
                      : 'bg-line text-ink hover:bg-line'
                  }`}
                >
                  Tất cả slide ({slideCount})
                </button>
              </div>
              <p className="text-xs text-muted">
                {settings.exportAllSlides
                  ? `Xuất tất cả ${slideCount} slide thành một video`
                  : `Chỉ xuất slide ${currentSlideIndex + 1}`}
              </p>
            </div>
          )}

          {/* Gồm âm thanh */}
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink">Gồm âm thanh</span>
              <button
                onClick={() => setSettings((s) => ({ ...s, includeAudio: !s.includeAudio }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.includeAudio ? 'bg-accent' : 'bg-line'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${
                    settings.includeAudio ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
            <p className="text-xs text-muted">
              {settings.includeAudio
                ? 'Sẽ gồm âm thanh (xử lý lâu hơn)'
                : 'Xuất video không có âm thanh (nhanh hơn)'}
            </p>
          </div>

          {/* Đầu ra ước tính */}
          <div className="bg-paper/50 rounded-lg p-3 border border-line">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Dung lượng ước tính:</span>
              <span className="text-ink font-medium">{estimatedSize}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-line flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-line hover:bg-line rounded-full text-sm font-medium transition-colors text-ink"
          >
            Hủy
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-accent rounded-full text-sm font-medium transition-all text-accent-ink shadow-sm"
          >
            Xuất video
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Helper Functions
// ==========================================

/**
 * Calculate estimated file size based on export settings
 * Formula: bitrate * duration / 8 (convert bits to bytes)
 */
function calculateEstimatedSize(settings: ExportSettings, slideCount: number): string {
  // Assume average slide duration of 5 seconds
  const avgSlideDuration = 5;
  const totalDuration = settings.exportAllSlides ? slideCount * avgSlideDuration : avgSlideDuration;

  // Calculate size in bytes: bitrate (bits/sec) * duration (sec) / 8 (bits to bytes)
  const sizeBytes = (settings.bitrate * totalDuration) / 8;

  // Format size
  if (sizeBytes < 1024 * 1024) {
    return `~${Math.round(sizeBytes / 1024)} KB`;
  } else {
    return `~${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

export default ExportSettingsModal;
