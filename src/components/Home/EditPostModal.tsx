import React, { useEffect, useState } from "react";
import { FaGlobe, FaLock, FaUserFriends } from "react-icons/fa";
import { toast } from "react-toastify";
import { updatePostWithExtras } from "../../graphql/post";
import { graphQLClientErrorCheck } from "../../plugins/graphql.plugin";
import type { Audience, PostWithExtras } from "../../types/social";
import { useI18n } from "../../i18n/I18nProvider";
import MentionTextarea from "./MentionTextarea";
import { Dialog } from "@astryxdesign/core/Dialog";
import { DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { Text } from "@astryxdesign/core/Text";
import { SegmentedControl } from "@astryxdesign/core/SegmentedControl";
import { SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";

interface IProps {
  post: PostWithExtras;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: Partial<PostWithExtras>) => void;
}

const AUDIENCE_ICONS: Record<Audience, React.ReactNode> = {
  public: <FaGlobe className="text-xs" />,
  friends: <FaUserFriends className="text-xs" />,
  "only-me": <FaLock className="text-xs" />,
};

/**
 * P1.5 — Sửa bài: nội dung + quyền xem (audience). Lưu qua updatePost.
 * Ảnh giữ nguyên như cũ (truyền lại images hiện tại để backend không mất).
 */
const EditPostModal: React.FC<IProps> = ({ post, open, onClose, onSaved }) => {
  const { t } = useI18n();
  const audienceOptions: { value: Audience; label: string }[] = [
    { value: "public", label: t("feed.audience.public") },
    { value: "friends", label: t("feed.audience.friends") },
    { value: "only-me", label: t("feed.audience.onlyMe") },
  ];
  const [content, setContent] = useState(post.content);
  const [audience, setAudience] = useState<Audience>(
    (post.audience as Audience) || "public"
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(post.content);
      setAudience((post.audience as Audience) || "public");
    }
  }, [open, post]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error(t("feed.editPost.emptyContent"));
      return;
    }
    setSaving(true);
    try {
      const res = await updatePostWithExtras({
        uuid: post.uuid,
        content,
        images: post.images ?? [],
        audience,
      });
      if (!graphQLClientErrorCheck(res)) {
        toast.error(res?.updatePost?.message || t("feed.editPost.saveFailed"));
        return;
      }
      if (res.updatePost.code !== 200) {
        toast.error(res.updatePost.message || t("feed.editPost.saveFailed"));
        return;
      }
      const updated = res.updatePost.post ?? {};
      toast.success(res.updatePost.message || t("feed.editPost.saved"));
      onSaved({
        content: updated.content ?? content,
        images: updated.images ?? post.images,
        audience: (updated.audience as Audience) ?? audience,
      });
      onClose();
    } catch {
      toast.error(t("feed.editPost.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      width={576}
      purpose="form">
      <VStack gap={3}>
        <DialogHeader
          title={t("feed.editPost.title")}
          onOpenChange={(isOpen) => {
            if (!isOpen) onClose();
          }}
        />
        <MentionTextarea
          value={content}
          onChange={setContent}
          placeholder={t("feed.editPost.placeholder")}
          rows={5}
          className="field h-auto min-h-28 w-full resize-none py-2"
        />
        <VStack gap={1}>
          <Text weight="medium" size="sm">
            {t("feed.editPost.audienceLabel")}
          </Text>
          <SegmentedControl
            value={audience}
            onChange={(value) => setAudience(value as Audience)}
            label={t("feed.editPost.audienceLabel")}>
            {audienceOptions.map((option) => (
              <SegmentedControlItem
                key={option.value}
                value={option.value}
                label={option.label}
                icon={AUDIENCE_ICONS[option.value]}
              />
            ))}
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
            label={saving ? t("feed.editPost.saving") : t("feed.editPost.save")}
            variant="primary"
            type="button"
            isLoading={saving}
            isDisabled={saving}
            onClick={handleSave}
          />
        </HStack>
      </VStack>
    </Dialog>
  );
};

export default EditPostModal;
