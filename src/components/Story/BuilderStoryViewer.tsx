import React from "react";
import { StoryPreviewV2 } from "./builder/ui/preview/StoryPreviewV2";
import type { Story as BuilderStory } from "./builder/types";

interface BuilderStoryViewerProps {
  /** Toàn bộ document builder (slides + elements) từ feed (kind: "builder"). */
  document: Record<string, unknown>;
  onClose: () => void;
}

/**
 * Viewer cho builder story đã publish.
 *
 * Tái dùng chính player của builder (StoryPreviewV2): thanh tiến trình thật
 * theo duration từng slide, tap 1/3 trái-phải chuyển slide, giữ giữa để
 * tạm dừng, phím Arrow/Escape, hiệu ứng enter/loop bằng GSAP/Anime.js thật.
 * Hết slide cuối thì đóng (onClose) như preview gốc. Tính năng shop
 * (nút mua hàng / CTA bar) đã bị xóa khỏi builder — MXH không có shop.
 */
const BuilderStoryViewer: React.FC<BuilderStoryViewerProps> = ({
  document,
  onClose,
}) => {
  const story = document as unknown as BuilderStory;

  return <StoryPreviewV2 story={story} onClose={onClose} />;
};

export default BuilderStoryViewer;
