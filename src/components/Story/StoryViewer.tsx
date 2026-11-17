import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { BsEye, BsTrash, BsX } from "react-icons/bs";
import { toast } from "react-toastify";
import { deleteStory, isVideoUrl } from "../../lib/social";
import type { Story, StoryFeedGroup } from "../../types/social";
import { useI18n } from "../../i18n/I18nProvider";
import { useStoreUser } from "../../store/user";
import { useStoryPlayback } from "./useStoryPlayback";
import { Avatar } from "@astryxdesign/core/Avatar";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

const IMAGE_STORY_MS = 5000;
const VIDEO_STORY_MAX_MS = 15000;
/** Giữ quá 220ms mới tính là giữ để tạm dừng; chạm nhanh hơn là tap chuyển story. */
const HOLD_DELAY_MS = 220;

interface StoryViewerProps {
  groups: StoryFeedGroup[];
  groupIndex: number;
  storyIndex: number;
  currentUserId?: string | null;
  onNavigate: (groupIndex: number, storyIndex: number) => void;
  onClose: () => void;
  onStoryDeleted: () => void;
}

/**
 * Màn xem story (tách từ StoryRow).
 * - Thanh tiến trình thật, chạy bằng useStoryPlayback (ảnh 5s, video tối đa
 *   15s / hết clip thì chuyển); bấm vào từng đoạn để nhảy tới story đó.
 * - Giữ (press-and-hold) lên vùng media để tạm dừng, thả ra chạy tiếp.
 * - Tap 1/3 trái = story trước, 1/3 phải = story sau.
 * - Phím ArrowRight/ArrowLeft chuyển story, Escape đóng (bỏ qua khi đang gõ).
 * - Header: avatar + tên + lượt xem + xóa (story của mình) + đóng.
 * - Đánh dấu đã xem vẫn do StoryRow giữ (effect theo story hiện tại).
 * - Viewer luôn đen ở cả hai mode (bg-black/text-white cố định, không
 *   dùng token ink/accent-ink — token ink đảo trắng ở dark mode, làm
 *   viewer trắng và chữ/progress chìm trên ảnh; tiền lệ: FollowListModal
 *   dùng bg-black/50 cho overlay).
 */
const StoryViewer: React.FC<StoryViewerProps> = ({
  groups,
  groupIndex,
  storyIndex,
  currentUserId,
  onNavigate,
  onClose,
  onStoryDeleted,
}) => {
  const { t } = useI18n();
  const { user } = useStoreUser();
  const group = groups[groupIndex] ?? null;
  const currentStory: Story | null = group?.stories[storyIndex] ?? null;
  const isOwnStory = !!(
    currentStory &&
    (currentUserId ?? user?.id) &&
    currentStory.user.id === (currentUserId ?? user?.id)
  );
  const isVideo = currentStory ? isVideoUrl(currentStory.mediaUrl) : false;

  const [paused, setPaused] = useState(false);
  const [videoDurationMs, setVideoDurationMs] =
    useState(VIDEO_STORY_MAX_MS);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heldRef = useRef(false);
  const advancedRef = useRef(false);
  const mediaRef = useRef<HTMLDivElement | null>(null);

  const goNext = useCallback(() => {
    const g = groups[groupIndex];
    if (!g) {
      onClose();
      return;
    }
    if (storyIndex + 1 < g.stories.length) {
      onNavigate(groupIndex, storyIndex + 1);
    } else if (groupIndex + 1 < groups.length) {
      onNavigate(groupIndex + 1, 0);
    } else {
      onClose();
    }
  }, [groups, groupIndex, storyIndex, onNavigate, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      onNavigate(groupIndex, storyIndex - 1);
      return;
    }
    if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      onNavigate(groupIndex - 1, prevGroup.stories.length - 1);
    }
  }, [groups, groupIndex, storyIndex, onNavigate]);

  // Chống chuyển 2 lần khi video onEnded và hook onEnded cùng bắn.
  const advanceOnce = useCallback(() => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    goNext();
  }, [goNext]);

  const durationMs = isVideo ? videoDurationMs : IMAGE_STORY_MS;
  const { progress } = useStoryPlayback({
    durationMs,
    playing: !paused && !!currentStory,
    storyKey: currentStory?.id ?? null,
    onEnded: advanceOnce,
  });

  // Đổi story: reset trạng thái phát lại.
  useEffect(() => {
    setPaused(false);
    setVideoDurationMs(VIDEO_STORY_MAX_MS);
    advancedRef.current = false;
    heldRef.current = false;
  }, [currentStory?.id]);

  // Video đi theo trạng thái tạm dừng (giữ để pause).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else video.play().catch(() => undefined);
  }, [paused, currentStory?.id]);

  // Phím tắt: mũi tên chuyển story, Escape đóng (bỏ qua khi đang gõ).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, onClose]);

  const clearHoldTimer = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  useEffect(() => clearHoldTimer, []);

  const handlePointerDown = () => {
    heldRef.current = false;
    clearHoldTimer();
    holdTimerRef.current = setTimeout(() => {
      heldRef.current = true;
      setPaused(true);
    }, HOLD_DELAY_MS);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    clearHoldTimer();
    if (heldRef.current) {
      // Vừa giữ để tạm dừng -> thả ra chạy tiếp, không chuyển story.
      heldRef.current = false;
      setPaused(false);
      return;
    }
    // Tap nhanh: 1/3 trái = trước, 1/3 phải = sau, giữa = không làm gì.
    const rect = mediaRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const x = (e.clientX - rect.left) / rect.width;
    if (x < 1 / 3) goPrev();
    else if (x > 2 / 3) goNext();
  };

  const handlePointerCancel = () => {
    clearHoldTimer();
    if (heldRef.current) {
      heldRef.current = false;
      setPaused(false);
    }
  };

  const handleDelete = async () => {
    if (!currentStory) return;
    if (!window.confirm(t("feed.story.deleteConfirm"))) return;
    try {
      await deleteStory(currentStory.id);
      toast.success(t("feed.story.deleted"));
      onStoryDeleted();
    } catch {
      toast.error(t("feed.story.deleteFailed"));
    }
  };

  if (!currentStory || !group) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <VStack
        gap={0}
        className="relative w-full max-w-md overflow-hidden rounded-xl bg-black shadow-lg">
        {/* Thanh tiến trình */}
        <HStack gap={1} className="absolute left-0 right-0 top-0 z-10 p-2">
          {group.stories.map((story, i) => (
            <button
              key={story.id}
              type="button"
              aria-label={t("feed.story.storyNumber", { n: i + 1 })}
              onClick={() => onNavigate(groupIndex, i)}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <span
                className="block h-full rounded-full bg-white"
                style={{
                  width:
                    i < storyIndex
                      ? "100%"
                      : i === storyIndex
                        ? `${Math.round(progress * 100)}%`
                        : "0%",
                }}
              />
            </button>
          ))}
        </HStack>
        {/* Header: avatar + tên + lượt xem + xóa + đóng */}
        <HStack
          gap={2}
          vAlign="center"
          className="absolute left-0 right-0 top-4 z-10 px-3">
          <Avatar
            src={currentStory.user.avatar || "/images/user-avatar.png"}
            name={currentStory.user.fullName}
            size={36}
            tooltip={false}
          />
          <StackItem size="fill">
            <Text
              weight="semibold"
              size="sm"
              maxLines={1}
              className="text-white">
              {currentStory.user.fullName}
            </Text>
          </StackItem>
          <HStack gap={1} vAlign="center" className="text-xs text-white/80">
            <BsEye /> {currentStory.viewCount}
          </HStack>
          {isOwnStory && (
            <IconButton
              label={t("feed.story.deleteStory")}
              icon={<BsTrash />}
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleDelete}
              className="text-white"
            />
          )}
          <IconButton
            label={t("feed.story.close")}
            icon={<BsX />}
            variant="ghost"
            size="sm"
            type="button"
            onClick={onClose}
            className="text-white"
          />
        </HStack>
        {/* Nội dung story — giữ để tạm dừng, tap trái/phải để chuyển */}
        <div
          ref={mediaRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerCancel}
          onPointerCancel={handlePointerCancel}
          className="relative flex h-[70vh] touch-none select-none items-center justify-center bg-black">
          {isVideo ? (
            <video
              key={currentStory.id}
              ref={videoRef}
              src={currentStory.mediaUrl}
              autoPlay
              controls
              playsInline
              onLoadedMetadata={(e) => {
                const d = e.currentTarget.duration;
                if (Number.isFinite(d) && d > 0) {
                  setVideoDurationMs(
                    Math.min(Math.round(d * 1000), VIDEO_STORY_MAX_MS)
                  );
                }
              }}
              onEnded={advanceOnce}
              className="max-h-full max-w-full"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentStory.mediaUrl}
              alt={t("feed.story.storyOf", {
                name: currentStory.user.fullName,
              })}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
        <Text className="pb-2 pt-1 text-center text-xs text-white/60">
          {t("feed.story.holdToPause")}
        </Text>
      </VStack>
    </div>
  );
};

export default StoryViewer;
