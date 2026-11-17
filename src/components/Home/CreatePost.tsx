import React, { useEffect, useRef, useState } from "react";
import autosize from "autosize";
import { BsX } from "react-icons/bs";
import { BiMessageSquareEdit } from "react-icons/bi";
import { FaGlobe, FaLock, FaUserFriends, FaPoll } from "react-icons/fa";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import Image from "next/image";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import jsonP from "@ptndev/json";
import { useStoreUser } from "../../store/user";
import {
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { createPostWithExtras } from "../../graphql/post";
import type { Audience } from "../../types/social";
import { useI18n } from "../../i18n/I18nProvider";
import { isVideoUrl } from "../../lib/social";
import MentionTextarea from "./MentionTextarea";
import PollCreator, { PollDraft } from "./PollCreator";
import { Card } from "@astryxdesign/core/Card";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { ButtonGroup } from "@astryxdesign/core/ButtonGroup";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

interface IProps {
  setNewPost: (newPost: boolean) => void;
  /** P1.4 — đăng vào nhóm: bài sẽ mang groupId này. */
  groupId?: string;
  /** P1.4 — tên nhóm hiển thị trong composer khi đăng vào nhóm. */
  groupName?: string;
}

const AUDIENCE_ICONS: Record<Audience, React.ReactNode> = {
  public: <FaGlobe className="text-sm" />,
  friends: <FaUserFriends className="text-sm" />,
  "only-me": <FaLock className="text-sm" />,
};

const CreatePost: React.FC<IProps> = ({ setNewPost, groupId, groupName }) => {
  const [postFiles, setPostFiles] = useState<File[]>([]);
  const [postMediaPreview, setPostMediaPreview] = useState<
    { url: string; isVideo: boolean }[]
  >([]);
  const [postContents, setPostContents] = useState("");
  const [audience, setAudience] = useState<Audience>("public");
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollDraft, setPollDraft] = useState<PollDraft>({
    question: "",
    options: ["", ""],
    multiple: false,
  });

  const textareaRef = useRef<any>(null);
  const filePickerRef = useRef<any>(null);
  const { user } = useStoreUser();
  const { t } = useI18n();
  const audienceOptions: { value: Audience; label: string }[] = [
    { value: "public", label: t("feed.audience.public") },
    { value: "friends", label: t("feed.audience.friends") },
    { value: "only-me", label: t("feed.audience.onlyMe") },
  ];

  useEffect(() => {
    autosize(textareaRef.current);
  }, [postContents]);

  const { register, handleSubmit } = useForm();

  const clearMedia = () => {
    postMediaPreview.forEach((m) => URL.revokeObjectURL(m.url));
    setPostMediaPreview([]);
    setPostFiles([]);
  };

  const onSubmit = async () => {
    const poll =
      pollEnabled && pollDraft.question.trim()
        ? {
            question: pollDraft.question.trim(),
            options: pollDraft.options
              .map((o) => o.trim())
              .filter((o) => o.length > 0),
            multiple: pollDraft.multiple,
          }
        : null;
    if (pollEnabled && poll) {
      if (poll.options.length < 2) {
        toast.error(t("feed.create.pollNeedOptions"));
        return;
      }
    }
    if (!postContents.trim() && postFiles.length === 0 && !poll) {
      toast.error(t("feed.create.emptyPost"));
      return;
    }
    toast(t("feed.create.posting"));
    const formData = new FormData();
    let imagesData: string[] = [];
    if (postFiles.length > 0) {
      postFiles.forEach((file: File) => {
        formData.append("images", file);
      });

      const resImages = await axios.post("/image", formData);
      if (resImages.data.code === 200) {
        if (resImages.data.images) {
          imagesData = resImages.data.images;
        }
      }
    }
    try {
      const resPost = await createPostWithExtras({
        content: jsonP.stringify(postContents),
        images: imagesData ? imagesData : [],
        audience,
        groupId,
        poll,
      });
      if (resPost.createPost.code !== 200) {
        toast(resPost.createPost.message);
        return;
      }
      if (graphQLClientErrorCheck(resPost)) {
        toast.success(resPost.createPost.message);
        setPostContents("");
        clearMedia();
        setAudience("public");
        setPollEnabled(false);
        setPollDraft({ question: "", options: ["", ""], multiple: false });

        setNewPost(true);
      }
    } catch {
      toast.error(t("feed.create.postFailed"));
    }
  };

  const canSubmit =
    postContents.trim() !== "" ||
    postFiles.length > 0 ||
    (pollEnabled && pollDraft.question.trim() !== "");

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="start">
            <Avatar
              src={user?.avatar || "/images/user-avatar.png"}
              name={user?.fullName}
              size={48}
              tooltip={false}
            />
            <StackItem size="fill">
              <VStack gap={2}>
                <HStack gap={2} vAlign="center" className="flex-wrap">
                  <Text weight="medium" size="lg">
                    {user?.fullName}
                  </Text>
                  {groupName && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent-bright">
                      {t("feed.create.groupBadge", { group: groupName })}
                    </span>
                  )}
                  {/* P1.5 — chọn audience lúc đăng */}
                  <label className="flex items-center gap-1 text-xs text-muted">
                    {AUDIENCE_ICONS[audience]}
                    <select
                      value={audience}
                      onChange={(e) =>
                        setAudience(e.target.value as Audience)
                      }
                      className="max-w-full rounded-md border border-line bg-paper py-1 pl-1 pr-5 text-xs text-ink">
                      {audienceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </HStack>
                <MentionTextarea
                  {...register("postContent")}
                  textareaRef={textareaRef}
                  value={postContents}
                  onChange={setPostContents}
                  placeholder={
                    groupName
                      ? t("feed.create.groupPlaceholder", { group: groupName })
                      : t("feed.create.placeholder")
                  }
                  rows={2}
                  className="w-full placeholder:text-sm text-ink resize-none max-h-40 focus:outline-none focus:border-none focus:ring-0 bg-transparent border-none scrollbar-hide overflow-y-scroll scrollbar scroll-ml-5"
                />
              </VStack>
            </StackItem>
          </HStack>
          {/* P1.3 — tạo poll */}
          {pollEnabled && (
            <HStack gap={0} vAlign="start">
              <StackItem size="fill">
                <PollCreator value={pollDraft} onChange={setPollDraft} />
              </StackItem>
              <IconButton
                label={t("feed.create.poll")}
                icon={<BsX />}
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => setPollEnabled(false)}
              />
            </HStack>
          )}
          {/* media preview: ảnh + video */}
          {postMediaPreview.length > 0 ? (
            <VStack gap={2} className="relative w-full">
              {postMediaPreview.map((media, index: number) => (
                <div className="sm:p-2" key={index}>
                  <div className="relative h-72 w-full sm:rounded-lg overflow-hidden border border-line">
                    {media.isVideo ? (
                      <video
                        src={media.url}
                        controls
                        preload="metadata"
                        className="h-full w-full object-contain bg-ink"
                      />
                    ) : (
                      <Image
                        src={media.url}
                        alt="Pham Thanh Nam"
                        layout="fill"
                        objectFit="cover"
                      />
                    )}
                  </div>
                </div>
              ))}

              <IconButton
                label={t("common.cancel")}
                icon={<BsX />}
                variant="ghost"
                size="sm"
                type="button"
                onClick={clearMedia}
                className="absolute top-3 right-1"
              />
            </VStack>
          ) : (
            ""
          )}

          <input
            ref={filePickerRef}
            accept="image/*,video/*"
            type="file"
            name="file"
            id="file"
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (!files || files.length === 0) return;
              const picked = Array.from(files);
              const oversized = picked.find(
                (f) => f.type.startsWith("video/") && f.size > 100 * 1024 * 1024
              );
              if (oversized) {
                toast.error(t("feed.create.videoMax"));
                return;
              }
              const previews = picked.map((file) => ({
                url: URL.createObjectURL(file),
                isVideo:
                  file.type.startsWith("video/") || isVideoUrl(file.name),
              }));
              setPostMediaPreview((prev) => [...prev, ...previews]);
              setPostFiles((prev) => [...prev, ...picked]);
            }}
            className="hidden"
          />
          <ButtonGroup label={t("feed.create.post")}>
            <Button
              label={t("feed.create.imageVideo")}
              icon={<MdOutlinePhotoSizeSelectActual />}
              variant="ghost"
              type="button"
              onClick={() => filePickerRef.current.click()}
            />
            <Button
              label={t("feed.create.poll")}
              icon={<FaPoll />}
              variant="ghost"
              type="button"
              onClick={() => setPollEnabled(!pollEnabled)}
            />
            <Button
              label={t("feed.create.post")}
              icon={<BiMessageSquareEdit />}
              variant="primary"
              type="submit"
              isDisabled={!canSubmit}
            />
          </ButtonGroup>
        </VStack>
      </form>
    </Card>
  );
};

export default CreatePost;
