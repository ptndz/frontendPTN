import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import { GetServerSideProps } from "next";
import { IPost, User } from "../gql/graphql";
import type { PostWithExtras } from "../types/social";
import { getAuthenticatedUser } from "../lib/pages-router-auth";
import Navigation from "../components/Share/Navigation";
import FollowButton from "../components/Share/FollowButton";
import SinglePost from "../components/Home/SinglePost";
import { useStoreUser } from "../store/user";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import { Stack } from "@astryxdesign/core/Stack";
import { Card } from "@astryxdesign/core/Card";
import { TextInput } from "@astryxdesign/core/TextInput";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Button } from "@astryxdesign/core/Button";
import { useI18n } from "../i18n/I18nProvider";
import { List, ListItem } from "@astryxdesign/core/List";
import { Avatar } from "@astryxdesign/core/Avatar";

const DynamicWidgetMessage = dynamic(
  () => import("../components/Messages/WidgetMessage"),
  {
    ssr: false,
  }
);

interface IProps {
  userData: User;
}

type SearchType = "all" | "posts" | "users" | "bookmarks";

interface SearchUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string | null;
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

const PAGE_SIZE = 10;

const TYPE_TABS: { key: SearchType }[] = [
  { key: "all" },
  { key: "posts" },
  { key: "users" },
  { key: "bookmarks" },
];

/** Bookmarks từ API search có thể là { post } hoặc trực tiếp là post. */
function normalizeBookmarks(raw: unknown): IPost[] {
  if (!Array.isArray(raw)) return [];
  const posts: IPost[] = [];
  for (const item of raw) {
    const post = (item as any)?.post ?? item;
    if (post && typeof post === "object" && typeof post.uuid === "string") {
      posts.push(post as IPost);
    }
  }
  return posts;
}

const SearchPage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();

  const tabLabel = (key: SearchType): string =>
    key === "all"
      ? t("feed.all")
      : key === "posts"
        ? t("search.postsTab")
        : key === "users"
          ? t("search.usersTab")
          : t("search.bookmarksTab");
  const { setUser } = useStoreUser();
  const router = useRouter();
  const q = typeof router.query.q === "string" ? router.query.q : "";

  const [inputValue, setInputValue] = useState(q);
  const [type, setType] = useState<SearchType>("all");
  const [posts, setPosts] = useState<IPost[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [bookmarks, setBookmarks] = useState<IPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [deletePost, setDeletePost] = useState<boolean>(false);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [setUser, userData]);

  // Đồng bộ ô nhập với ?q= trên URL (vd khi gõ từ nav).
  useEffect(() => {
    setInputValue(q);
  }, [q]);

  // Gõ trong ô nhập của trang -> debounce rồi đẩy lên URL.
  useEffect(() => {
    const value = inputValue.trim();
    if (!value || value === q) return;
    const timer = setTimeout(() => {
      router.push({ pathname: "/search", query: { q: value } });
    }, 400);
    return () => clearTimeout(timer);
  }, [inputValue, q, router]);

  // Tìm kiếm khi q/type đổi (debounce 300ms).
  useEffect(() => {
    if (!q.trim()) {
      setPosts([]);
      setUsers([]);
      setBookmarks([]);
      setTotal(0);
      setPage(1);
      return;
    }
    setPage(1);
    let cancelled = false;
    setLoading(true);
    setError(false);
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get("/search", {
          params: { q, type, page: 1, limit: PAGE_SIZE },
        });
        if (cancelled) return;
        const data = res.data ?? {};
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setUsers(Array.isArray(data.users) ? data.users : []);
        setBookmarks(normalizeBookmarks(data.bookmarks));
        setTotal(typeof data.total === "number" ? data.total : 0);
      } catch (err) {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q, type]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await axios.get("/search", {
        params: { q, type, page: nextPage, limit: PAGE_SIZE },
      });
      const data = res.data ?? {};
      if (Array.isArray(data.posts)) {
        setPosts((prev) => [...prev, ...data.posts]);
      }
      if (Array.isArray(data.users)) {
        setUsers((prev) => [...prev, ...data.users]);
      }
      setBookmarks((prev) => [...prev, ...normalizeBookmarks(data.bookmarks)]);
      setPage(nextPage);
    } catch (err) {
      toast.error(t("search.loadMoreFailed"));
    } finally {
      setLoadingMore(false);
    }
  };

  const shownCount = posts.length + users.length + bookmarks.length;
  const hasMore = total > 0 ? shownCount < total : false;
  const noResults =
    q.trim() !== "" && !loading && !error && shownCount === 0;

  const showUsers = type === "all" || type === "users";
  const showPosts = type === "all" || type === "posts";
  const showBookmarks = type === "all" || type === "bookmarks";

  if (!userData) {
    return null;
  }

  return (
    <>
      <Navigation />
      <Stack gap={4} className="mx-auto w-full max-w-3xl bg-paper px-2 pt-2">
        <Card>
          <Stack gap={3}>
            <TextInput
              label={t("search.label")}
              isLabelHidden
              type="search"
              startIcon="search"
              value={inputValue}
              onChange={(value) => setInputValue(value)}
              onEnter={() => {
                const value = inputValue.trim();
                if (value && value !== q) {
                  router.push({
                    pathname: "/search",
                    query: { q: value },
                  });
                }
              }}
              placeholder={t("search.placeholder")}
            />
            <SegmentedControl
              value={type}
              onChange={(value) => setType(value as SearchType)}
              label={t("search.typeLabel")}
              size="sm"
              layout="hug">
              {TYPE_TABS.map((tab) => (
                <SegmentedControlItem
                  key={tab.key}
                  value={tab.key}
                  label={tabLabel(tab.key)}
                />
              ))}
            </SegmentedControl>
          </Stack>
        </Card>

        {loading ? (
          <Stack gap={3}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={96} />
            ))}
          </Stack>
        ) : error ? (
          <EmptyState
            title={t("search.loadFailed")}
            description={t("search.loadFailedHint")}
          />
        ) : q.trim() === "" ? (
          <EmptyState
            title={t("search.label")}
            description={t("search.emptyHint")}
          />
        ) : noResults ? (
          <EmptyState
            title={t("search.noResults", { q })}
            description={t("search.tryDifferent")}
          />
        ) : (
          <>
            {showUsers && users.length > 0 && (
              <Stack gap={2}>
                <Heading level={2}>{t("search.usersHeading")}</Heading>
                <List hasDividers>
                  {users.map((u) => (
                    <ListItem
                      key={u.id}
                      label={
                        <Link href={`/${u.username}`}>
                          <Text
                            weight="semibold"
                            className="cursor-pointer hover:underline">
                            {u.fullName}
                          </Text>
                        </Link>
                      }
                      description={`@${u.username}${
                        typeof u.followerCount === "number"
                          ? ` · ${t("follow.followersCount", { count: u.followerCount })}`
                          : ""
                      }`}
                      startContent={
                        <Avatar
                          src={u.avatar || "/images/user-avatar.png"}
                          name={u.fullName}
                          size={48}
                          tooltip={false}
                        />
                      }
                      endContent={
                        /* P4.1 — theo dõi ngay từ kết quả tìm kiếm. */
                        u.id !== userData.id ? (
                          <FollowButton
                            userId={u.id}
                            initialFollowing={u.isFollowing}
                          />
                        ) : undefined
                      }
                    />
                  ))}
                </List>
              </Stack>
            )}

            {showPosts && posts.length > 0 && (
              <Stack gap={3}>
                <Heading level={2}>{t("search.postsHeading")}</Heading>
                {/* Mobile: bài full-bleed như feed/explore (trang dùng px-2 nên cột
                    bài hẹp hơn feed 16px, đủ làm hàng action wrap/cắt label). */}
                <Stack gap={3} className="-mx-2 sm:mx-0">
                  {posts.map((post) => (
                    <SinglePost
                      key={post.uuid}
                      // W6: IPost không gán trực tiếp được cho
                      // PostWithExtras (schema nullable) — cast, không đổi
                      // dữ liệu runtime.
                      post={post as PostWithExtras}
                      loading={false}
                      isBookmarkPage={false}
                      deletePost={deletePost}
                      setDeletePost={setDeletePost}
                      bookmarkedPostsId={[]}
                    />
                  ))}
                </Stack>
              </Stack>
            )}

            {showBookmarks && bookmarks.length > 0 && (
              <Stack gap={3}>
                <Heading level={2}>{t("search.bookmarksHeading")}</Heading>
                {/* Mobile: bài full-bleed như feed/explore (xem trên). */}
                <Stack gap={3} className="-mx-2 sm:mx-0">
                  {bookmarks.map((post) => (
                    <SinglePost
                      key={post.uuid}
                      // W6: như trên — cast IPost sang PostWithExtras.
                      post={post as PostWithExtras}
                      loading={false}
                      isBookmarkPage={true}
                      deletePost={deletePost}
                      setDeletePost={setDeletePost}
                      bookmarkedPostsId={[post.uuid]}
                    />
                  ))}
                </Stack>
              </Stack>
            )}

            {hasMore && (
              <Button
                variant="secondary"
                width="100%"
                isLoading={loadingMore}
                label={loadingMore ? t("common.loading") : t("feed.loadMore")}
                onClick={handleLoadMore}
                className="mb-8"
              />
            )}
          </>
        )}
        <DynamicWidgetMessage />
      </Stack>
    </>
  );
};

export default SearchPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const user = await getAuthenticatedUser(context);

    if (user) {
      return {
        props: {
          userData: user,
        },
      };
    }
  } catch (error) {}

  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};
