import type { ExportSettings } from '../ui/modals';
import type { Story, StorySlide } from '../types';

export interface RenderCallbacks {
  setIsRendering: (value: boolean) => void;
  setRenderProgress: (value: number) => void;
  setLoadingStatus: (value: string) => void;
  setRenderTime: (value: number) => void;
  setCurrentSlideId: (id: string) => void;
}

export async function renderWithWebCodecs(
  _story: Story,
  _currentSlide: StorySlide,
  _settings: ExportSettings,
  _ffmpegRef: any,
  _callbacks: RenderCallbacks
): Promise<void> {
  alert('Hệ thống Story của Bot Bán Hàng chạy trực tiếp dạng tương tác Miniapp (không cần xuất MP4). Bạn có thể bấm "Lưu Story" để phát hành tức thì!');
}

export async function renderWithFFmpeg(
  _story: Story,
  _currentSlide: StorySlide,
  _settings: ExportSettings,
  _ffmpegRef: any,
  _callbacks: RenderCallbacks
): Promise<void> {
  alert('Hệ thống Story của Bot Bán Hàng chạy trực tiếp dạng tương tác Miniapp (không cần xuất MP4). Bạn có thể bấm "Lưu Story" để phát hành tức thì!');
}
