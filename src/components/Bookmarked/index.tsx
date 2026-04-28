import axios from "axios";
import React, { useEffect, useState } from "react";
import { BsBookmark } from "react-icons/bs";
import SinglePost from "../Home/SinglePost";
import Navigation from "../Share/Navigation";
import { IBookmark } from "../../gql/graphql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { queryBookmarkPost } from "../../graphql/bookmark";
import Link from "next/link";

const BookmarkedPosts = () => {
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
    fetchBookmarkedPostsId();
  }, []);

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      setLoading(true);
      const res = await graphQLClient.request(queryBookmarkPost);
      if (graphQLClientErrorCheck(res)) {
        if (res.bookmarkAll.bookmarks) {
          setBookmarkedPosts(res.bookmarkAll.bookmarks);
        }
      }
      setLoading(false);
    };
    fetchBookmarkedPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <BsBookmark className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Saved Posts</h1>
        </div>

        {bookmarkedPosts?.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
              <BsBookmark className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">No saved posts yet</p>
              <p className="text-sm text-gray-400 mt-1">Posts you save will appear here.</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center h-9 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
            >
              Explore posts
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarkedPosts
              ?.map((bookmark) => (
                <SinglePost
                  loading={loading}
                  bookmarkedPostsId={bookmarkedPostsId || []}
                  key={bookmark.post.uuid}
                  post={bookmark.post}
                  deletePost={deletePost}
                  setDeletePost={setDeletePost}
                  isBookmarkPage={false}
                />
              ))
              .reverse()}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkedPosts;
