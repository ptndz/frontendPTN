import axios from "axios";
import React, { useEffect, useState } from "react";
import { BsBookmarkX } from "react-icons/bs";

import SinglePost from "../Home/SinglePost";
import Navigation from "../Share/Navigation";
import { useStoreUser } from "../../store/user";
import { IBookmark } from "../../gql/graphql";
import { graphql } from "../../gql";
import { graphQLClient } from "../../plugins/graphql.plugin";

const BookmarkedPosts = () => {
  const [controller, setController] = useState(false);

  const [removedBookmarked, setRemovedBookmarked] = useState(false);
  const [bookmarkedPostsId, setBookmarkedPostsId] = useState<string[]>();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<IBookmark[]>();
  const [loading, setLoading] = useState(false);

  const [deletePost, setDeletePost] = useState<boolean>(false);

  useEffect(() => {
    const fetchBookmarkedPostsId = async () => {
      const res = await axios.get("/bookmark/all");
      if (res.data.code === 200) {
        setBookmarkedPostsId(res.data.bookmarkedPostsId || []);
      }
    };

    const fetchBookmarkedPosts = async () => {
      const queryBookmarkPost = graphql(`
        query bookmarkAll {
          bookmarkAll {
            code
            success
            bookmarks {
              id
              createAt
              user {
                id
                username
                fullName
                avatar
              }
              post {
                uuid
                content
                createAt
                updateAt
                shares
                images
                user {
                  id
                  username
                  avatar
                  fullName
                }
                likes {
                  id
                  reactions
                  user {
                    id
                    username
                    avatar
                    fullName
                  }
                }
                comments {
                  id
                  content
                  user {
                    id
                    username
                    avatar
                    fullName
                  }
                }
              }
            }
          }
        }
      `);
      const res = await graphQLClient.request(queryBookmarkPost);
      if (res.bookmarkAll.code === 200) {
        if (res.bookmarkAll.bookmarks) {
          setBookmarkedPosts(res.bookmarkAll.bookmarks);
        }
      }
    };
    fetchBookmarkedPostsId();
    fetchBookmarkedPosts();
  }, []);

  return (
    <>
      <Navigation />
      <div className="max-w-3xl mx-auto">
        {bookmarkedPosts?.length === 0 ? (
          <div className="px-3 h-full flex items-center justify-center py-10">
            <div className="relative col-span-4 block max-w-2xl w-full mx-auto border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <BsBookmarkX className="mx-auto h-12 w-12 dark:text-white text-black" />
              <span className="mt-2 block text-lg font-medium text-gray-900 dark:text-gray-50">
                You have no post bookmarked!
              </span>
            </div>
          </div>
        ) : (
          bookmarkedPosts
            ?.map((bookmark) => (
              <SinglePost
                loading={loading}
                bookmarkedPostsId={bookmarkedPostsId || []}
                key={bookmark.post.uuid}
                post={bookmark.post}
                deletePost={deletePost}
                setDeletePost={setDeletePost}
                setController={undefined}
                isBookmarkPage={undefined}
                setRemovedBookmarked={undefined}
              />
            ))
            .reverse()
        )}
      </div>
    </>
  );
};

export default BookmarkedPosts;
