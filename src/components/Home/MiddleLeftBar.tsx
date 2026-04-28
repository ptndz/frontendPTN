import React, { useEffect, useRef, useState, Fragment } from "react";
import PostSkeleton from "../Loaders/PostSkeleton";
import CreatePost from "./CreatePost";
import SinglePost from "./SinglePost";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import axios from "axios";
import { queryPosts } from "../../graphql/post";

const MiddleLeftBar = () => {
  const [bookmarkedPostsId, setBookmarkedPostsId] = useState<string[]>();
  const [loading] = useState(false);
  const [deletePost, setDeletePost] = useState<boolean>(false);
  const [newPost, setNewPost] = useState<boolean>(false);

  const getPost = async (pageParam: number) => {
    const resPost = await graphQLClient.request(queryPosts, {
      page: pageParam,
      limit: 20,
    });
    if (graphQLClientErrorCheck(resPost)) {
      return resPost.posts;
    }
    return resPost.posts;
  };

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["posts"],
      queryFn: ({ pageParam }) => getPost(pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const page = lastPage?.page ? lastPage.page + 1 : 1;
        return page;
      },
    });

  const loadMoreRef = useRef() as React.RefObject<HTMLButtonElement>;
  const router = useRouter();

  useEffect(() => {
    fetchNextPage();
  }, [fetchNextPage, newPost]);

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver((entries) =>
      entries.forEach((entry) => entry.isIntersecting && fetchNextPage())
    );

    const el = loadMoreRef && loadMoreRef.current;
    if (!el) return;

    observer.observe(el);
    return () => { observer.disconnect(); };
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
    <div className="space-y-4">
      <CreatePost setNewPost={setNewPost} />
      {loading && [1, 2, 3].map((i) => <PostSkeleton key={i} />)}

      {data?.pages.map((data) => (
        <Fragment key={data.page}>
          {data?.posts &&
            [...data.posts].reverse().map((post) => (
              <SinglePost
                loading={loading}
                bookmarkedPostsId={bookmarkedPostsId || []}
                key={post.uuid}
                post={post}
                deletePost={deletePost}
                setDeletePost={setDeletePost}
                isBookmarkPage={false}
              />
            ))}
        </Fragment>
      ))}

      <button
        ref={loadMoreRef}
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
        className="w-full h-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isFetchingNextPage
          ? "Loading more..."
          : hasNextPage
          ? "Load more posts"
          : "You're all caught up"}
      </button>
      {isFetching && !isFetchingNextPage && (
        <p className="text-center text-sm text-gray-400">Refreshing...</p>
      )}
    </div>
  );
};

export default MiddleLeftBar;
