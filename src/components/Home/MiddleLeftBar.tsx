import React, { useEffect, useRef, useState, Fragment } from "react";
import PostSkeleton from "../Loaders/PostSkeleton";
import CreatePost from "./CreatePost";
import SinglePost from "./SinglePost";
import { useStoreUser } from "../../store/user";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { graphql } from "../../gql";

const MiddleLeftBar = () => {
  const [bookmarkedPostsId, setBookmarkedPostsId] = useState([]);

  const [loading, setLoading] = useState(false);

  const [isLike, setIsLike] = useState(false);
  const [deletePost, setDeletePost] = useState(false);
  const [newPost, setNewPost] = useState<boolean>(false);
  const { user } = useStoreUser();
  const queryPost = graphql(`
    query posts {
      posts {
        code
        success
        message
        posts {
          uuid
          content
          createAt
          updateAt
          shares
          images
          user {
            avatar
            username
            fullName
          }
          likes {
            id
            reactions
            user {
              avatar
              username
              fullName
            }
          }
          comments {
            id
            content
            user {
              avatar
              username
              fullName
            }
          }
        }
      }
    }
  `);
  const getPost = async (pageParam: string) => {
    const resPost = await graphQLClient.request(queryPost);

    return resPost.posts;
  };
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery(
      ["posts"],
      ({ pageParam = "01-01-9999" }) => getPost(pageParam),
      {
        getNextPageParam: (lastPage, _allPages) => {
          const time = lastPage;

          return time;
        },
      }
    );

  const loadMoreRef = useRef() as React.RefObject<HTMLButtonElement>;
  const router = useRouter();
  useEffect(() => {
    console.log(user);
  }, [user]);
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
  }, [hasNextPage, router, fetchNextPage]);

  return (
    <div>
      <CreatePost setNewPost={setNewPost} />
      {loading && Array(3).map((_, i) => <PostSkeleton key={i} />)}

      {data?.pages
        .map((data, i) => (
          <Fragment key={i}>
            {data?.posts &&
              data?.posts.map((post) => (
                <SinglePost
                  loading={loading}
                  bookmarkedPostsId={bookmarkedPostsId}
                  key={post.uuid}
                  post={post}
                  isLike={isLike}
                  setIsLike={setIsLike}
                  deletePost={deletePost}
                  setDeletePost={setDeletePost}
                  setController={undefined}
                  isBookmarkPage={undefined}
                  setRemovedBookmarked={undefined}
                />
              ))}
          </Fragment>
        ))
        .reverse()}

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
