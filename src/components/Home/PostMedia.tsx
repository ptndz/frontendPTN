import React from "react";
import Carousel from "./Carousel";
import { partitionMedia } from "../../lib/social";
import { VStack } from "@astryxdesign/core/VStack";

interface IProps {
  images?: string[] | null;
}

/**
 * P1.2 — Media của bài viết: video render <video controls preload="metadata">,
 * ảnh giữ nguyên Carousel cũ. Tách theo đuôi file / /video/ (xem lib/social).
 */
const PostMedia: React.FC<IProps> = ({ images }) => {
  const { videos, images: imageUrls } = partitionMedia(images);
  if (videos.length === 0 && imageUrls.length === 0) return null;
  return (
    <VStack gap={3}>
      {videos.map((src, index) => (
        <video
          key={`video-${index}`}
          src={src}
          controls
          preload="metadata"
          playsInline
          className="max-h-96 w-full rounded-xl bg-ink"
        />
      ))}
      {imageUrls.length > 0 && <Carousel images={imageUrls} />}
    </VStack>
  );
};

export default PostMedia;
