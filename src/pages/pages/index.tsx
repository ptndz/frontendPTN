import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  createPage,
  fetchPages,
  followPage,
  unfollowPage,
  uploadImages,
} from "../../lib/p4";
import type { P4Page } from "../../types/p4";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { FileInput } from "@astryxdesign/core/FileInput";
import { Grid } from "@astryxdesign/core/Grid";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { List, ListItem } from "@astryxdesign/core/List";
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
 * P4.3 — Trang Page: tìm kiếm + lọc danh mục + danh sách + tạo Page.
 * v1 Page KHÔNG có feed riêng (chỉ hồ sơ + theo dõi).
 */
const PagesPage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const { setUser } = useStoreUser();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [pages, setPages] = useState<P4Page[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const load = async (
    q: string,
    cat: string,
    p: number,
    append = false
  ) => {
    setLoading(true);
    try {
      const res = await fetchPages({ q, category: cat, page: p, limit: 20 });
      setPages((prev) => (append ? [...prev, ...res.pages] : res.pages));
      setTotal(res.total);
      setPage(p);
    } catch {
      toast.error(t("pages.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      () => load(search.trim(), category.trim(), 1),
      300
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error(t("pages.enterName"));
      return;
    }
    setCreating(true);
    try {
      let coverImage: string | null = null;
      if (coverFile) {
        const urls = await uploadImages([coverFile]);
        coverImage = urls[0] ?? null;
      }
      const created = await createPage({
        name: name.trim(),
        description: description.trim(),
        category: categoryInput.trim(),
        coverImage,
      });
      toast.success(t("pages.created"));
      setShowCreate(false);
      setName("");
      setDescription("");
      setCategoryInput("");
      setCoverFile(null);
      if (created) setPages((prev) => [created, ...prev]);
      else load("", "", 1);
    } catch {
      toast.error(t("pages.createFailed"));
    } finally {
      setCreating(false);
    }
  };

  const handleFollowToggle = async (p: P4Page) => {
    try {
      const updated = p.isFollowing
        ? await unfollowPage(p.id)
        : await followPage(p.id);
      if (updated) {
        setPages((prev) =>
          prev.map((x) => (x.id === p.id ? updated : x))
        );
      } else {
        load(search.trim(), category.trim(), 1);
      }
    } catch {
      toast.error(t("pages.actionFailed"));
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
          <Card>
            <VStack gap={3}>
              <HStack justify="between" vAlign="center" gap={2}>
                <HStack gap={2} vAlign="center">
                  <FaFlag className="text-accent-bright" />
                  <Heading level={1}>{t("pages.title")}</Heading>
                </HStack>
                <Button
                  label={showCreate ? t("common.close") : `+ ${t("pages.createPage")}`}
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreate(!showCreate)}
                />
              </HStack>
              {showCreate && (
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
                    placeholder={t("pages.descriptionPlaceholder")}
                    rows={3}
                    isOptional
                  />
                  <TextInput
                    label={t("pages.categoryLabel")}
                    value={categoryInput}
                    onChange={(v) => setCategoryInput(v)}
                    placeholder={t("pages.categoryPlaceholder")}
                    isOptional
                  />
                  <FileInput
                    label={t("pages.coverLabel")}
                    value={coverFile}
                    onChange={(f) =>
                      setCoverFile(
                        Array.isArray(f) ? (f[0] ?? null) : f
                      )
                    }
                    accept="image/*"
                    isOptional
                  />
                  <Button
                    label={creating ? t("pages.creating") : t("pages.createPage")}
                    variant="primary"
                    width="100%"
                    isLoading={creating}
                    onClick={handleCreate}
                  />
                </VStack>
              )}
              <Grid columns={{ minWidth: 220, max: 2 }} gap={2}>
                <TextInput
                  label={t("pages.searchLabel")}
                  type="search"
                  value={search}
                  onChange={(v) => setSearch(v)}
                  placeholder={t("pages.searchPlaceholder")}
                  isLabelHidden
                  hasClear
                />
                <TextInput
                  label={t("pages.categoryFilterLabel")}
                  value={category}
                  onChange={(v) => setCategory(v)}
                  placeholder={t("pages.categoryFilterPlaceholder")}
                  isLabelHidden
                />
              </Grid>
            </VStack>
          </Card>

          {loading && pages.length === 0 ? (
            <VStack gap={3}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={96} index={i} />
              ))}
            </VStack>
          ) : pages.length === 0 ? (
            <EmptyState
              title={
                search.trim() || category.trim()
                  ? t("pages.noPagesFound")
                  : t("pages.noPages")
              }
              description={
                search.trim() || category.trim()
                  ? undefined
                  : t("pages.createFirst")
              }
            />
          ) : (
            <List hasDividers>
              {pages.map((p) => (
                <ListItem
                  key={p.id}
                  startContent={
                    <Avatar name={p.name} size={48} shape="rounded" />
                  }
                  label={
                    <Link href={`/pages/${p.id}`}>
                      <Text weight="semibold" maxLines={1}>
                        {p.name}
                      </Text>
                    </Link>
                  }
                  description={
                    <VStack gap={0.5}>
                      <Text type="supporting">
                        {p.category ? `${p.category} · ` : ""}
                        {t("follow.followersCount", { count: p.followerCount })}
                      </Text>
                      {p.description && (
                        <Text type="supporting" maxLines={1}>
                          {p.description}
                        </Text>
                      )}
                    </VStack>
                  }
                  endContent={
                    p.ownerId && userData.id === p.ownerId ? (
                      <Text type="supporting" color="accent" weight="medium">
                        {t("pages.yourPage")}
                      </Text>
                    ) : (
                      <Button
                        label={
                          p.isFollowing ? t("follow.following") : t("follow.follow")
                        }
                        variant={p.isFollowing ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => handleFollowToggle(p)}
                      />
                    )
                  }
                />
              ))}
            </List>
          )}

          {total > pages.length && (
            <Button
              label={loading ? t("common.loading") : t("feed.loadMore")}
              variant="secondary"
              width="100%"
              isLoading={loading}
              onClick={() =>
                load(search.trim(), category.trim(), page + 1, true)
              }
            />
          )}
          <DynamicWidgetMessage />
        </VStack>
      </HStack>
    </>
  );
};

export default PagesPage;

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
