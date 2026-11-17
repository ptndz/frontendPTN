import axios from "axios";
import React, { useEffect, useState } from "react";
import { BsBookmarkX } from "react-icons/bs";
import SinglePost from "../Home/SinglePost";
import Navigation from "../Share/Navigation";
import { IBookmark } from "../../gql/graphql";
import { Center } from "@astryxdesign/core/Center";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Stack } from "@astryxdesign/core/Stack";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { queryBookmarkPost } from "../../graphql/bookmark";
import type { PostWithExtras } from "../../types/social";
import { useI18n } from "../../i18n/I18nProvider";

const BookmarkedPosts = () => {
  const { t } = useI18n();
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
      const res = await graphQLClient.request(queryBookmarkPost);

      if (graphQLClientErrorCheck(res)) {
        if (res.bookmarkAll.bookmarks) {
          // W6: bookmarks là Maybe<IBookmark>[] — lọc phần tử null. Query
          // này không select `verified` của user nên kết quả không gán
          // trực tiếp được cho IBookmark (verified: Boolean!) — cast
          // type-only, không đổi dữ liệu runtime.
          setBookmarkedPosts(
            res.bookmarkAll.bookmarks.filter(
              (bookmark): bookmark is NonNullable<typeof bookmark> =>
                bookmark != null
            ) as unknown as IBookmark[]
          );
        }
      }
    };

    fetchBookmarkedPosts();
  }, []);

  return (
    <>
      <Navigation />
      <Center axis="horizontal">
        <Stack width="100%" maxWidth={768} gap={4}>
          {bookmarkedPosts?.length === 0 ? (
            <EmptyState
              title={t("bookmarked.noBookmarks")}
              icon={<BsBookmarkX size={48} />}
            />
          ) : (
            bookmarkedPosts
              ?.map((bookmark) => (
                <SinglePost
                  loading={loading}
                  bookmarkedPostsId={bookmarkedPostsId || []}
                  key={bookmark.post.uuid}
                  // W6: IPost (schema: mảng/poll nullable) không gán trực tiếp
                  // được cho PostWithExtras — cast, không đổi dữ liệu runtime.
                  post={bookmark.post as PostWithExtras}
                  deletePost={deletePost}
                  setDeletePost={setDeletePost}
                  isBookmarkPage={false}
                />
              ))
              .reverse()
          )}
        </Stack>
      </Center>
    </>
  );
};

export default BookmarkedPosts;
