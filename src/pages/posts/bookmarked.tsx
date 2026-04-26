import React, { useEffect } from "react";
import BookmarkedPosts from "../../components/Bookmarked";
import { useStoreUser } from "../../store/user";
import Login from "../login";
import { GetServerSideProps } from "next";
import { User } from "../../gql/graphql";
import dynamic from "next/dynamic";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";

const DynamicWidgetMessage = dynamic(
  () => import("../../components/Messages/WidgetMessage"),
  {
    ssr: false,
  }
);
interface IProps {
  userData: User;
}
const BookmarkedPostsPage: React.FC<IProps> = ({ userData }) => {
  const { setUser } = useStoreUser();

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [setUser, userData]);

  if (userData) {
    return (
      <>
        <BookmarkedPosts />
        <DynamicWidgetMessage />
      </>
    );
  } else {
    return <Login />;
  }
};

export default BookmarkedPostsPage;
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
