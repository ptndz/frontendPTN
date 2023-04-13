import React from "react";
import BookmarkedPosts from "../../components/Bookmarked";
import { useStoreUser } from "../../store/user";
import Login from "../login";

const BookmarkedPostsPage = () => {
  const { user } = useStoreUser();
  if (user.id !== "") {
    return <BookmarkedPosts />;
  } else {
    return <Login />;
  }
};

export default BookmarkedPostsPage;
