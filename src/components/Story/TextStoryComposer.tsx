import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { createStory } from "../../lib/social";
import { useI18n } from "../../i18n/I18nProvider";
import { createEmptyTextStoryDraft } from "./storyTypes";
import type { TextStoryDraft } from "./storyTypes";
import {
  TEXT_STORY_BACKGROUNDS,
  TEXT_STORY_FONTS,
  TEXT_STORY_TEXT_COLORS,
} from "./textStoryPresets";
import { renderTextStoryToBlob } from "./renderTextStory";
import { Dialog } from "@astryxdesign/core/Dialog";
import { DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { Text } from "@astryxdesign/core/Text";
import { SegmentedControl } from "@astryxdesign/core/SegmentedControl";
import { SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";

const TEXT_MAX_LENGTH = 200;
/** Cỡ chữ preview (px) theo draft size 0/1/2 — tỉ lệ với canvas 1080px. */
const PREVIEW_FONT_SIZES = [12, 16, 22] as const;

interface TextStoryComposerProps {
  open: boolean;
  onClose: () => void;
  onPosted: () => void;
}

/**
 * Soạn tin chữ: chọn nền + màu chữ + phông + cỡ chữ, xem trước trực tiếp,
 * rồi render ra ảnh 1080x1920 (canvas) và đăng qua flow ảnh sẵn có
 * (POST /image -> POST /stories) — không đổi backend.
 */
const TextStoryComposer: React.FC<TextStoryComposerProps> = ({
  open,
  onClose,
  onPosted,
}) => {
  const { t } = useI18n();
  const [draft, setDraft] = useState<TextStoryDraft>(() =>
    createEmptyTextStoryDraft()
  );
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (open) setDraft(createEmptyTextStoryDraft());
  }, [open ]);

  const text = draft.content.text;
  const canPost = text.trim().length > 0 && !posting;
  const font =
    TEXT_STORY_FONTS.find((f) => f.key === draft.content.font) ??
    TEXT_STORY_FONTS[0];

  const updateContent = (patch: Partial<TextStoryDraft["content"]>) =>
    setDraft((prev) => ({
      ...prev,
      content: { ...prev.content, ...patch },
    }));

  const handlePost = async () => {
    if (!canPost) return;
    setPosting(true);
    try {
      const blob = await renderTextStoryToBlob(draft);
      const formData = new FormData();
      formData.append("images", blob, "text-story.png");
      const resImages = await axios.post("/image", formData);
      const urls: string[] = resImages.data?.images ?? [];
      const mediaUrl = urls[0];
      if (!mediaUrl) {
        toast.error(t("feed.story.uploadFailed"));
        return;
      }
      await createStory({ mediaUrl, mediaType: "image" });
      toast.success(t("feed.story.posted"));
      onPosted();
      onClose();
    } catch (e) {
      // Lỗi render canvas thì báo riêng, còn lại dùng lỗi đăng chung.
      if (e instanceof Error && /render/i.test(e.message)) {
        toast.error(t("feed.story.renderFailed"));
      } else {
        toast.error(t("feed.story.postFailed"));
      }
    } finally {
      setPosting(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      width={520}
      maxHeight="92dvh"
      purpose="form">
      <VStack gap={2}>
        <DialogHeader
          title={t("feed.story.textStoryTitle")}
          onOpenChange={(isOpen) => {
            if (!isOpen) onClose();
          }}
        />

        {/* Xem trước trực tiếp — nhỏ gọn để cả dialog vừa màn hình 375px */}
        <div
          className="mx-auto flex aspect-[9/16] w-full max-w-[110px] items-center justify-center overflow-hidden rounded-2xl p-3"
          style={{ background: draft.background.value }}>
          <p
            className="w-full break-words"
            style={{
              fontFamily: font.family,
              fontSize: PREVIEW_FONT_SIZES[draft.content.size],
              lineHeight: 1.3,
              fontWeight: 600,
              color: draft.content.textColor,
              textAlign: draft.content.align,
              whiteSpace: "pre-wrap",
            }}>
            {text.trim() ? text : t("feed.story.writeText")}
          </p>
        </div>

        {/* Nhập nội dung */}
        <VStack gap={1}>
          <textarea
            value={text}
            onChange={(e) =>
              updateContent({ text: e.target.value.slice(0, TEXT_MAX_LENGTH) })
            }
            maxLength={TEXT_MAX_LENGTH}
            rows={2}
            placeholder={t("feed.story.writeText")}
            className="field h-auto min-h-14 w-full resize-none py-2"
          />
          <Text type="supporting" size="sm" className="text-right">
            {text.length}/{TEXT_MAX_LENGTH}
          </Text>
        </VStack>

        {/* Màu nền */}
        <VStack gap={1}>
          <Text weight="medium" size="sm">
            {t("feed.story.background")}
          </Text>
          <div className="flex flex-wrap gap-2">
            {TEXT_STORY_BACKGROUNDS.map((bg) => {
              const selected =
                draft.background.value === bg.value &&
                draft.background.type === bg.type;
              return (
                <button
                  key={`${bg.type}-${bg.value}`}
                  type="button"
                  title={bg.name}
                  aria-label={bg.name ?? bg.value}
                  aria-pressed={selected}
                  onClick={() =>
                    setDraft((prev) => ({ ...prev, background: bg }))
                  }
                  className={`h-8 w-8 rounded-full border border-line ${
                    selected ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""
                  }`}
                  style={{ background: bg.value }}
                />
              );
            })}
          </div>
        </VStack>

        {/* Màu chữ */}
        <VStack gap={1}>
          <Text weight="medium" size="sm">
            {t("feed.story.textColor")}
          </Text>
          <div className="flex flex-wrap gap-2">
            {TEXT_STORY_TEXT_COLORS.map((color) => {
              const selected = draft.content.textColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  aria-pressed={selected}
                  onClick={() => updateContent({ textColor: color })}
                  className={`h-8 w-8 rounded-full border border-line ${
                    selected ? "ring-2 ring-accent ring-offset-2 ring-offset-surface" : ""
                  }`}
                  style={{ background: color }}
                />
              );
            })}
          </div>
        </VStack>

        {/* Phông chữ */}
        <VStack gap={1}>
          <Text weight="medium" size="sm">
            {t("feed.story.font")}
          </Text>
          <SegmentedControl
            value={draft.content.font}
            onChange={(value) => updateContent({ font: String(value) })}
            label={t("feed.story.font")}>
            {TEXT_STORY_FONTS.map((f) => (
              <SegmentedControlItem
                key={f.key}
                value={f.key}
                label={f.label}
              />
            ))}
          </SegmentedControl>
        </VStack>

        {/* Cỡ chữ */}
        <VStack gap={1}>
          <Text weight="medium" size="sm">
            {t("feed.story.size")}
          </Text>
          <SegmentedControl
            value={String(draft.content.size)}
            onChange={(value) =>
              updateContent({ size: Number(value) as 0 | 1 | 2 })
            }
            label={t("feed.story.size")}>
            <SegmentedControlItem value="0" label={t("feed.story.sizeSmall")} />
            <SegmentedControlItem
              value="1"
              label={t("feed.story.sizeMedium")}
            />
            <SegmentedControlItem value="2" label={t("feed.story.sizeLarge")} />
          </SegmentedControl>
        </VStack>

        <HStack gap={2} hAlign="end">
          <Button
            label={t("common.cancel")}
            variant="ghost"
            type="button"
            onClick={onClose}
          />
          <Button
            label={posting ? t("feed.story.uploading") : t("feed.story.postTextStory")}
            variant="primary"
            type="button"
            isLoading={posting}
            isDisabled={!canPost}
            onClick={handlePost}
          />
        </HStack>
      </VStack>
    </Dialog>
  );
};

export default TextStoryComposer;
