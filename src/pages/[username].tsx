import React, { useState } from "react";
import Navigation from "../components/Share/Navigation";
import UserProfile from "../components/userProfile/UserProfile";

import { User } from "../gql/graphql";
import Error from "./404";
import { queryGetUser } from "../graphql/user";
import { GetServerSideProps } from "next/types";

import { graphQLServer } from "../plugins/graphql.plugin";

interface IProps {
  userData: User;
}
const Profile: React.FC<IProps> = ({ userData }) => {
  const [updateUserData, setUpdateUserData] = useState(false);

  if (userData) {
    return (
      <>
        <Navigation />
        <div className="max-w-4xl mx-auto gap-4 bg-gray-100 dark:bg-zinc-900 pt-2 w-full ">
          <UserProfile
            userData={userData}
            setUpdateUserData={setUpdateUserData}
          />
        </div>
      </>
    );
  } else {
    return <Error />;
  }
};

export default Profile;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { username } = context.query;

  const res = await graphQLServer(context.req.headers.cookie).request(
    queryGetUser,
    {
      username: username as string,
    }
  );
  return {
    props: {
      userData: res.getUser.user,
    },
  };
};
