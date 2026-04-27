import React from "react";
import BookmarkedPosts from "../../components/Bookmarked";
import { User } from "../../gql/graphql";
import dynamic from "next/dynamic";
import { withAuthSSP } from "../../lib/with-auth-ssp";
import { useInitUser } from "../../hooks/useInitUser";

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
  useInitUser(userData);
  return (
    <>
      <BookmarkedPosts />
      <DynamicWidgetMessage />
    </>
  );
};

export default BookmarkedPostsPage;
export const getServerSideProps = withAuthSSP();
