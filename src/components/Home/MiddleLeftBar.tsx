import React, { useEffect, useRef, useState, Fragment } from "react";
import PostSkeleton from "../Loaders/PostSkeleton";
import CreatePost from "./CreatePost";
import StoryRow from "./StoryRow";
import SinglePost from "./SinglePost";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import axios from "axios";
import { fetchPostsPage } from "../../graphql/post";
import { fetchFollowingPosts } from "../../lib/social";
import { useI18n } from "../../i18n/I18nProvider";
import { VStack } from "@astryxdesign/core/VStack";
import { SegmentedControl } from "@astryxdesign/core/SegmentedControl";
import { SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Text } from "@astryxdesign/core/Text";

type FeedMode = "all" | "following";

const MiddleLeftBar = () => {
  const [bookmarkedPostsId, setBookmarkedPostsId] = useState<string[]>();

  const [loading, setLoading] = useState(false);

  const [deletePost, setDeletePost] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<boolean>(false);
  // P4.1 — chuyển feed "Tất cả" / "Đang theo dõi".
  const [feedMode, setFeedMode] = useState<FeedMode>("all");
  const { t } = useI18n();

  // P1 — query có poll/audience, tự fallback về query cũ nếu backend
  // chưa có field mới (xem fetchPostsPage trong src/graphql/post.ts).
  const getPost = async (pageParam: number) => {
    return fetchPostsPage(pageParam, 20);
  };
  const getFollowingPost = async (pageParam: number) => {
    return fetchFollowingPosts(pageParam, 20);
  };
  const allQuery = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => getPost(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages) => {
      const page = lastPage?.page ? lastPage.page + 1 : 1;
      return page;
    },
  });
  const followingQuery = useInfiniteQuery({
    queryKey: ["posts", "following"],
    queryFn: ({ pageParam }) => getFollowingPost(pageParam),
    initialPageParam: 1,
    // Chỉ gọi API khi user đang ở tab "Đang theo dõi".
    enabled: feedMode === "following",
    getNextPageParam: (lastPage, _allPages) => {
      const page = lastPage?.page ? lastPage.page + 1 : 1;
      return page;
    },
  });
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    feedMode === "all" ? allQuery : followingQuery;

  const loadMoreRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNextPage();
  }, [fetchNextPage, newPost]);

  useEffect(() => {
    if (!hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver((entries) =>
      entries.forEach((entry) => entry.isIntersecting && fetchNextPage())
    );

    const el = loadMoreRef && loadMoreRef.current;

    if (!el) {
      return;
    }

    observer.observe(el);
  }, [hasNextPage, router, fetchNextPage, deletePost]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/bookmark/all");
      if (res.data.status === 200) {
        setBookmarkedPostsId(res.data.bookmarkedPostsId || []);
      }
    };
    fetchData();
  }, [fetchNextPage]);

  return (
    <VStack gap={3}>
      <StoryRow />
      <CreatePost setNewPost={setNewPost} />
      {/* P4.1 — chuyển feed Tất cả / Đang theo dõi. */}
      <SegmentedControl
        value={feedMode}
        onChange={(value) => setFeedMode(value as FeedMode)}
        label={t("feed.all")}>
        <SegmentedControlItem value="all" label={t("feed.all")} />
        <SegmentedControlItem value="following" label={t("feed.following")} />
      </SegmentedControl>
      {loading && Array(3).map((_, i) => <PostSkeleton key={i} />)}

      {data?.pages.map((data, i) => (
        <Fragment key={data.page}>
          {data?.posts &&
            data?.posts
              .map((post) => (
                <SinglePost
                  loading={loading}
                  bookmarkedPostsId={bookmarkedPostsId || []}
                  key={post.uuid}
                  post={post}
                  deletePost={deletePost}
                  setDeletePost={setDeletePost}
                  isBookmarkPage={false}
                />
              ))
              .reverse()}
        </Fragment>
      ))}

      {feedMode === "following" &&
        !isFetching &&
        (data?.pages ?? []).every((p) => !p.posts?.length) && (
          <EmptyState
            title={t("feed.noPosts")}
            description={t("feed.noPostsHint")}
          />
        )}

      <VStack gap={2}>
        <Button
          ref={loadMoreRef}
          label={
            isFetchingNextPage
              ? t("feed.loadingMore")
              : hasNextPage
              ? t("feed.loadMore")
              : t("feed.nothingMore")
          }
          variant="secondary"
          width="100%"
          isDisabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        />
        <Text type="supporting">
          {isFetching && !isFetchingNextPage ? t("feed.fetching") : null}
        </Text>
      </VStack>
    </VStack>
  );
};

export default MiddleLeftBar;
