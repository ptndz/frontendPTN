import React, { useEffect, useState } from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { toast } from "react-toastify";
import { User } from "../gql/graphql";
import { getAuthenticatedUser } from "../lib/pages-router-auth";
import { useStoreUser } from "../store/user";
import Navigation from "../components/Share/Navigation";
import SinglePost from "../components/Home/SinglePost";
import FollowButton from "../components/Share/FollowButton";
import {
  fetchExploreTrending,
  ExploreTrending,
} from "../lib/social";
import dynamic from "next/dynamic";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Section } from "@astryxdesign/core/Section";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { List, ListItem } from "@astryxdesign/core/List";
import { Avatar } from "@astryxdesign/core/Avatar";
import { useI18n } from "../i18n/I18nProvider";

const DynamicWidgetMessage = dynamic(
  () => import("../components/Messages/WidgetMessage"),
  {
    ssr: false,
  }
);

interface IProps {
  userData: User;
}

/**
 * P4.2 — Trang khám phá: hashtag thịnh hành, bài viết thịnh hành,
 * người gợi ý kết bạn / theo dõi. Dữ liệu từ GET /explore/trending.
 */
const ExplorePage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const { setUser } = useStoreUser();
  const [data, setData] = useState<ExploreTrending | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deletePost, setDeletePost] = useState<boolean>(false);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [setUser, userData]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchExploreTrending()
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          toast.error(t("explore.loadFailed"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!userData) {
    return null;
  }

  return (
    <>
      <Navigation />
      <Stack gap={4} className="mx-auto w-full max-w-3xl bg-paper px-2 pt-2">
        <Heading level={1}>{t("explore.title")}</Heading>

        {loading ? (
          <Stack gap={3}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={96} />
            ))}
          </Stack>
        ) : error ? (
          <EmptyState
            title={t("explore.loadFailedTitle")}
            description={t("explore.loadFailedHint")}
          />
        ) : (
          <>
            {/* Hashtag thịnh hành */}
            <Section>
              <Stack gap={3}>
                <Heading level={2}>{t("explore.trendingHashtags")}</Heading>
                {data && data.trendingHashtags.length > 0 ? (
                  <HStack gap={2} wrap="wrap">
                    {data.trendingHashtags.map((h) => (
                      <Link
                        key={h.tag}
                        href={`/hashtag/${encodeURIComponent(h.tag)}`}
                        className="rounded-full bg-paper px-3 py-1.5 text-sm font-medium text-accent-bright hover:bg-accent/10">
                        #{h.tag}
                        <Text type="supporting">
                          {" "}
                          · {t("explore.postsCount", { count: h.postCount })}
                        </Text>
                      </Link>
                    ))}
                  </HStack>
                ) : (
                  <Text type="supporting">
                    {t("explore.noTrendingHashtags")}
                  </Text>
                )}
              </Stack>
            </Section>

            {/* Người gợi ý kết bạn / theo dõi */}
            <Stack gap={2}>
              <Heading level={2}>{t("explore.suggestions")}</Heading>
              {data && data.suggestedUsers.length > 0 ? (
                <List hasDividers>
                  {data.suggestedUsers.map((u) => (
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
                        <FollowButton
                          userId={u.id}
                          initialFollowing={u.isFollowing}
                        />
                      }
                    />
                  ))}
                </List>
              ) : (
                <EmptyState
                  isCompact
                  title={t("explore.noSuggestions")}
                />
              )}
            </Stack>

            {/* Bài viết thịnh hành */}
            <Stack gap={3}>
              <Heading level={2}>{t("explore.trendingPosts")}</Heading>
              {data && data.trendingPosts.length > 0 ? (
                // Mobile: bài full-bleed như feed (trang dùng px-2 nên cột
                // bài hẹp hơn feed 16px, đủ làm hàng action wrap/cắt label).
                // Chỉ nới cột bài, tiêu đề + các mục khác giữ nguyên px-2.
                <Stack gap={3} className="-mx-2 sm:mx-0">
                  {data.trendingPosts.map((post) => (
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
              ) : (
                <EmptyState
                  isCompact
                  title={t("explore.noTrendingPosts")}
                />
              )}
            </Stack>
          </>
        )}
        <DynamicWidgetMessage />
      </Stack>
    </>
  );
};

export default ExplorePage;

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
