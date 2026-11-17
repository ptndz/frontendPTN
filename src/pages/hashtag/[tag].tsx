import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { toast } from "react-toastify";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";
import Navigation from "../../components/Share/Navigation";
import SinglePost from "../../components/Home/SinglePost";
import { fetchHashtagPosts } from "../../lib/social";
import type { PostWithExtras } from "../../types/social";
import dynamic from "next/dynamic";
import { Stack } from "@astryxdesign/core/Stack";
import { Section } from "@astryxdesign/core/Section";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Button } from "@astryxdesign/core/Button";
import { useI18n } from "../../i18n/I18nProvider";

const DynamicWidgetMessage = dynamic(
  () => import("../../components/Messages/WidgetMessage"),
  { ssr: false }
);

interface IProps {
  userData: User;
}

/**
 * P1.6 — Trang hashtag: liệt kê các bài có #tag (GET /hashtags/:tag/posts).
 * Link tới đây được render từ RichText trong bài viết / bình luận.
 */
const HashtagPage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const { setUser } = useStoreUser();
  const router = useRouter();
  const tag = typeof router.query.tag === "string" ? router.query.tag : "";

  const [posts, setPosts] = useState<PostWithExtras[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deletePost, setDeletePost] = useState(false);

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const load = useCallback(
    async (p: number, append = false) => {
      if (!tag) return;
      setLoading(true);
      try {
        const res = await fetchHashtagPosts(tag, p, 20);
        setPosts((prev) => (append ? [...prev, ...res.posts] : res.posts));
        setTotal(res.total);
        setPage(p);
      } catch {
        toast.error(t("hashtag.loadFailed"));
      } finally {
        setLoading(false);
      }
    },
    [tag]
  );

  useEffect(() => {
    setPosts([]);
    setPage(1);
    load(1);
  }, [load]);

  return (
    <>
      <Navigation />
      <Stack gap={4} className="mx-auto w-full max-w-3xl bg-paper px-2 pt-2">
        <Section>
          <Stack gap={1}>
            <Heading level={1} color="accent">
              #{tag}
            </Heading>
            <Text type="supporting">
              {total > 0
                ? t("hashtag.postsCount", { count: total })
                : t("hashtag.allPosts")}
            </Text>
          </Stack>
        </Section>

        {loading && posts.length === 0 ? (
          <Stack gap={3}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={96} />
            ))}
          </Stack>
        ) : posts.length === 0 ? (
          <EmptyState
            title={t("hashtag.noPosts", { tag })}
          />
        ) : (
          <>
            {/* Mobile: bài full-bleed như feed/explore (trang dùng px-2 nên cột
                bài hẹp hơn feed 16px, đủ làm hàng action wrap/cắt label). */}
            <Stack gap={3} className="-mx-2 sm:mx-0">
              {posts.map((post) => (
                <SinglePost
                  key={post.uuid}
                  post={post}
                  loading={false}
                  isBookmarkPage={false}
                  deletePost={deletePost}
                  setDeletePost={setDeletePost}
                  bookmarkedPostsId={[]}
                />
              ))}
            </Stack>
            {total > posts.length && (
              <Button
                variant="secondary"
                width="100%"
                isLoading={loading}
                label={loading ? t("common.loading") : t("feed.loadMore")}
                onClick={() => load(page + 1, true)}
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

export default HashtagPage;

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
