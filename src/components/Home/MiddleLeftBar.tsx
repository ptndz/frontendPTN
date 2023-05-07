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

  const [loading, setLoading] = useState(false);

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
    useInfiniteQuery(["posts"], ({ pageParam = 1 }) => getPost(pageParam), {
      getNextPageParam: (lastPage, _allPages) => {
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
    <div>
      <CreatePost setNewPost={setNewPost} />
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

      <div>
        <button
          ref={loadMoreRef}
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}>
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
            ? "Load More"
            : "Nothing more to load"}
        </button>
      </div>
      <div>{isFetching && !isFetchingNextPage ? "Fetching..." : null}</div>
    </div>
  );
};

export default MiddleLeftBar;
