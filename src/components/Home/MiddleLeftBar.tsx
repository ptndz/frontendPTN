import axios from "axios";
import React, { useEffect, useState } from "react";
import PostSkeleton from "../Loaders/PostSkeleton";
import CreatePost from "./CreatePost";
import SinglePost from "./SinglePost";
import { useStoreUser } from "../../store/user";
import { Post, User } from "../../gql/graphql";

const MiddleLeftBar = () => {
  const [bookmarkedPostsId, setBookmarkedPostsId] = useState([]);
  const [userData, setUserData] = useState<User>();
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLike, setIsLike] = useState(false);
  const [deletePost, setDeletePost] = useState(false);
  const [newPost, setNewPost] = useState(false);
  const { user } = useStoreUser();

  useEffect(() => {
    axios.get(`/api/user?email=${user?.email}`).then(({ data }) => {
      setUserData(data);
      setBookmarkedPostsId(data?.bookmark);
    });
  }, [user.email, bookmarkedPostsId]);

  useEffect(() => {
    setLoading(true);
    try {
      axios.get(`/api/post`).then((data) => {
        setPosts(data?.data);
        setDeletePost(false);
        setNewPost(false);
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
    }
  }, [user?.email, isLike, deletePost, newPost]);

  const shuffle = (array: any) => {
    return array.sort(() => 0.5 - Math.random());
  };

  const postShuffle = (array: any, first: any) => {
    if (first) {
      const newArray = shuffle(array).filter(
        (element: any) => element !== first
      );
      return [first, ...newArray];
    }
    return shuffle(array);
  };

  return (
    <div>
      <CreatePost user={userData} setNewPost={setNewPost} />
      {loading && Array(3).map((_, i) => <PostSkeleton key={i} />)}
      {posts
        .map((post) => (
          <SinglePost
            loading={loading}
            bookmarkedPostsId={bookmarkedPostsId}
            key={post.id}
            post={post}
            isLike={isLike}
            setIsLike={setIsLike}
            deletePost={deletePost}
            setDeletePost={setDeletePost}
            userData={userData}
            setController={undefined}
            isBookmarkPage={undefined}
            setRemovedBookmarked={undefined}
          />
        ))
        .reverse()}
    </div>
  );
};

export default MiddleLeftBar;
