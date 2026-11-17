import React, { useCallback, useEffect, useRef, useState } from "react";
import { BsImage, BsPalette, BsPlus, BsType } from "react-icons/bs";
import { toast } from "react-toastify";
import axios from "axios";
import {
  createStory,
  fetchStoryFeed,
  viewBuilderStory,
  viewStory,
} from "../../lib/social";
import type { Story, StoryFeedGroup } from "../../types/social";
import { useStoreUser } from "../../store/user";
import { useI18n } from "../../i18n/I18nProvider";
import StoryViewer from "../Story/StoryViewer";
import BuilderStoryViewer from "../Story/BuilderStoryViewer";
import BuilderStoryModal from "../Story/BuilderStoryModal";
import TextStoryComposer from "../Story/TextStoryComposer";
import { Card } from "@astryxdesign/core/Card";
import { Avatar } from "@astryxdesign/core/Avatar";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";

/**
 * P1.1 — Vòng story trên đầu feed + màn xem story + đăng story.
 * - Vòng avatar: chưa xem -> ring-accent, đã xem -> ring-line.
 * - Viewer: <StoryViewer> (ảnh 5s, video hết clip/tối đa 15s, thanh tiến
 *   trình thật, giữ để tạm dừng, tap/phím chuyển story, xóa story của mình).
 * - Đăng story: chọn ảnh/video -> upload qua POST /image (như CreatePost)
 *   rồi POST /stories { mediaUrl, mediaType }; tin chữ qua
 *   <TextStoryComposer> (render canvas -> cùng flow ảnh).
 */
const StoryRow: React.FC = () => {
  const { user } = useStoreUser();
  const { t } = useI18n();
  const [groups, setGroups] = useState<StoryFeedGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewer, setViewer] = useState<{
    groupIndex: number;
    storyIndex: number;
  } | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  // Menu chọn loại tin (gộp "Chữ" + "Thiết kế" thành 1 nút +).
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const filePickerRef = useRef<HTMLInputElement>(null);

  const loadFeed = useCallback(async () => {
    try {
      const feed = await fetchStoryFeed();
      setGroups(feed);
    } catch {
      // Story chưa có trên backend (P1 backend đang xây) -> ẩn lặng,
      // chỉ giữ ô "Tin của bạn" để vẫn đăng được khi backend lên.
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const currentGroup = viewer ? groups[viewer.groupIndex] : null;
  const currentStory: Story | null =
    currentGroup && viewer
      ? (currentGroup.stories[viewer.storyIndex] ?? null)
      : null;

  // Đánh dấu đã xem khi story hiện tại đổi. Builder story đếm view qua
  // POST /builder-stories/:id/view (không dùng /stories/:id/view).
  useEffect(() => {
    if (!currentStory) return;
    if (currentStory.kind === "builder") {
      viewBuilderStory(currentStory.id).catch(() => undefined);
    } else {
      viewStory(currentStory.id).catch(() => undefined);
    }
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        stories: g.stories.map((s) =>
          s.id === currentStory.id
            ? { ...s, viewedByMe: true, viewCount: s.viewCount + 1 }
            : s
        ),
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStory?.id]);

  const handlePickFile = async (file: File | undefined) => {
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    if (!isVideo && !file.type.startsWith("image/")) {
      toast.error(t("feed.story.onlyMedia"));
      return;
    }
    if (isVideo && file.size > 100 * 1024 * 1024) {
      toast.error(t("feed.story.videoMax"));
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("images", file);
      const resImages = await axios.post("/image", formData);
      const urls: string[] = resImages.data?.images ?? [];
      const mediaUrl = urls[0];
      if (!mediaUrl) {
        toast.error(t("feed.story.uploadFailed"));
        return;
      }
      await createStory({
        mediaUrl,
        mediaType: isVideo ? "video" : "image",
      });
      toast.success(t("feed.story.posted"));
      loadFeed();
    } catch {
      toast.error(t("feed.story.postFailed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <HStack gap={3} className="overflow-x-auto pb-1 scrollbar-hide">
        {/* Ô "Tin của bạn" — bấm để mở menu chọn loại tin */}
        <button
          type="button"
          onClick={() => setCreateMenuOpen(true)}
          disabled={uploading}
          className="flex w-20 shrink-0 flex-col items-center gap-1 disabled:opacity-50">
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-paper ring-2 ring-line">
            {user?.avatar ? (
              <Avatar
                src={user.avatar}
                name={user.fullName}
                size={60}
                tooltip={false}
              />
            ) : (
              <span className="text-xl font-semibold">
                {user?.fullName?.charAt(0) ?? "?"}
              </span>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-ink ring-2 ring-surface">
              <BsPlus className="h-4 w-4" />
            </span>
          </span>
          <Text size="sm" maxLines={1} className="w-full text-center">
            {uploading ? t("feed.story.uploading") : t("feed.story.yourStory")}
          </Text>
        </button>
        <input
          ref={filePickerRef}
          accept="image/*,video/*"
          type="file"
          className="hidden"
          onChange={(e) => {
            handlePickFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {loading ? (
          <Text type="supporting" size="sm" className="flex items-center">
            {t("feed.story.loadingStories")}
          </Text>
        ) : (
          groups.map((group, groupIndex) => {
            const hasUnviewed = group.stories.some((s) => !s.viewedByMe);
            return (
              <button
                key={group.user.id || groupIndex}
                type="button"
                onClick={() =>
                  setViewer({ groupIndex, storyIndex: 0 })
                }
                className="flex w-20 shrink-0 flex-col items-center gap-1">
                <span
                  className={`h-16 w-16 rounded-full p-0.5 ring-2 ${
                    hasUnviewed ? "ring-accent" : "ring-line"
                  }`}>
                  <Avatar
                    src={group.user.avatar || "/images/user-avatar.png"}
                    name={group.user.fullName}
                    size={60}
                    tooltip={false}
                  />
                </span>
                <Text size="sm" maxLines={1} className="w-full text-center">
                  {group.user.fullName}
                </Text>
              </button>
            );
          })
        )}
      </HStack>

      {/* Menu chọn loại tin khi bấm nút + (tin chữ / Studio Tin) */}
      {createMenuOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label={t("feed.story.close")}
            onClick={() => setCreateMenuOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full max-w-xs rounded-t-2xl bg-paper p-2 shadow-lg ring-1 ring-line sm:rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setCreateMenuOpen(false);
                filePickerRef.current?.click();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-ink">
                <BsImage className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-medium">
                  {t("feed.create.imageVideo")}
                </span>
                <span className="block text-sm text-muted">
                  {t("feed.story.photoVideoHint")}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreateMenuOpen(false);
                setComposerOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-ink">
                <BsType className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-medium">
                  {t("feed.story.textStory")}
                </span>
                <span className="block text-sm text-muted">
                  {t("feed.story.textStoryTitle")}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCreateMenuOpen(false);
                setBuilderOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-surface">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-ink">
                <BsPalette className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-medium">
                  {t("feed.story.designBuilder")}
                </span>
                <span className="block text-sm text-muted">
                  {t("feed.story.designBuilderHint")}
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Màn xem story: builder story render từ document, story thường
          dùng StoryViewer cũ. Hết slide builder thì đóng viewer. */}
      {viewer && currentStory?.kind === "builder" && currentStory.document ? (
        <BuilderStoryViewer
          document={currentStory.document}
          onClose={() => setViewer(null)}
        />
      ) : (
        viewer && (
          <StoryViewer
            groups={groups}
            groupIndex={viewer.groupIndex}
            storyIndex={viewer.storyIndex}
            currentUserId={user?.id}
            onNavigate={(groupIndex, storyIndex) =>
              setViewer({ groupIndex, storyIndex })
            }
            onClose={() => setViewer(null)}
            onStoryDeleted={() => {
              setViewer(null);
              loadFeed();
            }}
          />
        )
      )}

      {/* Soạn tin chữ */}
      <TextStoryComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onPosted={() => {
          setComposerOpen(false);
          loadFeed();
        }}
      />

      {/* Story Studio (builder thiết kế) */}
      {builderOpen && (
        <BuilderStoryModal
          onClose={() => setBuilderOpen(false)}
          onPublished={() => loadFeed()}
        />
      )}
    </Card>
  );
};

export default StoryRow;
