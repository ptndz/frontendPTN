import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { toast } from "react-toastify";
import { useI18n } from "../../i18n/I18nProvider";
import { FaFlag } from "react-icons/fa";
import dynamic from "next/dynamic";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";
import Navigation from "../../components/Share/Navigation";
import {
  deletePage,
  fetchPage,
  followPage,
  unfollowPage,
  updatePage,
  uploadImages,
} from "../../lib/p4";
import type { P4Page } from "../../types/p4";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { FileInput } from "@astryxdesign/core/FileInput";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

const DynamicWidgetMessage = dynamic(
  () => import("../../components/Messages/WidgetMessage"),
  { ssr: false }
);


interface IProps {
  userData: User;
}

/**
 * P4.3 — Trang chi tiết Page: thông tin, theo dõi/bỏ theo dõi,
 * sửa/xóa (chỉ owner). Lưu ý v1: Page KHÔNG có feed riêng.
 */
const PageDetailPage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const { setUser, user } = useStoreUser();
  const router = useRouter();
  const pageId = typeof router.query.id === "string" ? router.query.id : "";

  const [page, setPage] = useState<P4Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const load = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    try {
      const p = await fetchPage(pageId);
      if (!p) {
        setNotFound(true);
      } else {
        setPage(p);
        setName(p.name);
        setDescription(p.description ?? "");
        setCategory(p.category ?? "");
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    load();
  }, [load]);

  const isOwner = !!page && !!user && page.ownerId === user.id;

  const handleFollowToggle = async () => {
    if (!page) return;
    setActionBusy(true);
    try {
      const updated = page.isFollowing
        ? await unfollowPage(page.id)
        : await followPage(page.id);
      if (updated) setPage(updated);
      toast.success(
        page.isFollowing ? t("pages.unfollowed") : t("pages.followed")
      );
    } catch {
      toast.error(t("pages.actionFailed"));
    } finally {
      setActionBusy(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!page) return;
    if (!name.trim()) {
      toast.error(t("pages.enterName"));
      return;
    }
    setActionBusy(true);
    try {
      let coverImage: string | null | undefined = undefined;
      if (coverFile) {
        const urls = await uploadImages([coverFile]);
        coverImage = urls[0] ?? null;
      }
      const updated = await updatePage(page.id, {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        ...(coverImage !== undefined ? { coverImage } : {}),
      });
      if (updated) setPage(updated);
      setShowEdit(false);
      setCoverFile(null);
      toast.success(t("pages.saved"));
    } catch {
      toast.error(t("pages.saveFailed"));
    } finally {
      setActionBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!page) return;
    if (!window.confirm(t("pages.deleteConfirm"))) return;
    setActionBusy(true);
    try {
      await deletePage(page.id);
      toast.success(t("pages.deleted"));
      router.push("/pages");
    } catch {
      toast.error(t("pages.deleteFailed"));
      setActionBusy(false);
    }
  };

  return (
    <>
      <Navigation />
      <HStack justify="center" width="100%" className="bg-paper">
        <VStack
          gap={3}
          width="100%"
          maxWidth={768}
          paddingInline={2}
          paddingBlockStart={2}
          paddingBlockEnd={8}>
          {loading ? (
            <Card>
              <Skeleton height={160} />
            </Card>
          ) : notFound || !page ? (
            <EmptyState
              title={t("pages.notFound")}
              actions={
                <Link href="/pages" className="text-sm text-accent-bright">
                  {`← ${t("pages.backToList")}`}
                </Link>
              }
            />
          ) : (
            <Card>
              <VStack gap={3}>
                {page.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={page.coverImage}
                    alt={page.name}
                    className="w-full h-56 object-cover rounded-lg"
                  />
                )}
                <HStack gap={2} vAlign="center">
                  <FaFlag className="text-accent-bright" />
                  <Heading level={1} className="min-w-0">
                    {page.name}
                  </Heading>
                </HStack>
                {page.category && (
                  <Text type="supporting" as="p">
                    {t("pages.category", { category: page.category })}
                  </Text>
                )}
                {page.description && (
                  <Text as="p" className="whitespace-pre-wrap">
                    {page.description}
                  </Text>
                )}
                <Text type="supporting" as="p">
                  {t("follow.followersCount", { count: page.followerCount })}
                  {page.owner && (
                    <>
                      {" · "}{t("pages.owner")}{" "}
                      <Link
                        href={`/${page.owner.username}`}
                        className="text-accent-bright">
                        {page.owner.fullName || page.owner.username}
                      </Link>
                    </>
                  )}
                </Text>
                <Text type="supporting" as="p">
                  {t("pages.noFeedNote")}
                </Text>

                <HStack gap={2} wrap="wrap" vAlign="center">
                  {isOwner ? (
                    <>
                      <Text
                        type="supporting"
                        color="accent"
                        weight="medium">
                        {t("pages.yourPage")}
                      </Text>
                      <Button
                        label={showEdit ? t("pages.closeEdit") : t("pages.editPage")}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEdit(!showEdit)}
                      />
                      <Button
                        label={t("pages.deletePage")}
                        variant="destructive"
                        size="sm"
                        isDisabled={actionBusy}
                        onClick={handleDelete}
                      />
                    </>
                  ) : (
                    <Button
                      label={
                        page.isFollowing ? t("follow.following") : t("follow.follow")
                      }
                      variant={page.isFollowing ? "secondary" : "primary"}
                      size="sm"
                      isDisabled={actionBusy}
                      onClick={handleFollowToggle}
                    />
                  )}
                </HStack>

                {showEdit && isOwner && (
                  <VStack gap={2}>
                    <TextInput
                      label={t("pages.nameLabel")}
                      value={name}
                      onChange={(v) => setName(v)}
                      placeholder={t("pages.nameLabel")}
                    />
                    <TextArea
                      label={t("pages.descriptionLabel")}
                      value={description}
                      onChange={(v) => setDescription(v)}
                      placeholder={t("pages.descriptionPlaceholderShort")}
                      rows={3}
                      isOptional
                    />
                    <TextInput
                      label={t("pages.categoryLabel")}
                      value={category}
                      onChange={(v) => setCategory(v)}
                      placeholder={t("pages.categoryPlaceholderShort")}
                      isOptional
                    />
                    <FileInput
                      label={t("pages.newCoverLabel")}
                      value={coverFile}
                      onChange={(f) =>
                        setCoverFile(
                          Array.isArray(f) ? (f[0] ?? null) : f
                        )
                      }
                      accept="image/*"
                      isOptional
                      description={t("pages.keepOldCover")}
                    />
                    <Button
                      label={actionBusy ? t("pages.saving") : t("pages.saveChanges")}
                      variant="primary"
                      width="100%"
                      isLoading={actionBusy}
                      onClick={handleSaveEdit}
                    />
                  </VStack>
                )}
              </VStack>
            </Card>
          )}
          <DynamicWidgetMessage />
        </VStack>
      </HStack>
    </>
  );
};

export default PageDetailPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const user = await getAuthenticatedUser(context);
    if (user) {
      return { props: { userData: user } };
    }
  } catch (error) {}

  return {
    redirect: { destination: "/login", permanent: false },
  };
};
