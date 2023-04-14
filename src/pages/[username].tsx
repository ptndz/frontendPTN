import React, { useEffect, useState } from "react";
import Navigation from "../components/Share/Navigation";
import UserProfile from "../components/userProfile/UserProfile";
import { User } from "../gql/graphql";
import Error from "./404";
import { queryGetUserByUsername, queryUser } from "../graphql/user";
import { GetServerSideProps } from "next/types";
import { graphQLServer } from "../plugins/graphql.plugin";
import { getCookies } from "cookies-next";
import { useStoreUser } from "../store/user";

interface IProps {
  userData: User;
  user: User;
}
const Profile: React.FC<IProps> = ({ userData, user }) => {
  const [updateUserData, setUpdateUserData] = useState(false);
  const { setUser } = useStoreUser();

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [setUser, user]);
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
  try {
    const cookie = getCookies({ req: context.req });
    if (cookie["ASP.NET_SessionId"]) {
      const res = await graphQLServer(context.req.headers.cookie).request(
        queryGetUserByUsername,
        {
          username: username as string,
        }
      );
      const resUser = await graphQLServer(context.req.headers.cookie).request(
        queryUser
      );
      return {
        props: {
          userData: res.getUser.user,
          user: resUser.user.user,
        },
      };
    }
    return {
      props: {},
    };
  } catch (error) {
    return {
      props: {},
    };
  }
};
