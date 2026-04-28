import React from "react";
import Navigation from "../components/Share/Navigation";
import AllFriends from "../components/FriendsCom/AllFriends";
import { User } from "../gql/graphql";
import { NextSeo } from "next-seo";
import dynamic from "next/dynamic";
import { withAuthSSP } from "../lib/with-auth-ssp";
import { useInitUser } from "../hooks/useInitUser";

const DynamicWidgetMessage = dynamic(
  () => import("../components/Messages/WidgetMessage"),
  { ssr: false }
);

interface IProps {
  userData: User;
}

const Friends: React.FC<IProps> = ({ userData }) => {
  useInitUser(userData);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <NextSeo
        title="Friends"
        description="Connect with friends and discover new people on PTN Social."
        canonical="https://phamthanhnam.com/friends"
      />
      <Navigation />
      <div className="max-w-5xl w-full mx-auto px-4 py-6">
        <AllFriends />
      </div>
      <DynamicWidgetMessage />
    </div>
  );
};

export default Friends;
export const getServerSideProps = withAuthSSP();
