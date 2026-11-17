import React, { useEffect, useState } from "react";
import Navigation from "../components/Share/Navigation";
import UserProfile from "../components/userProfile/UserProfile";
import { ProfileUser, User } from "../gql/graphql";
import Error from "./404";
import {
  queryGetUserByUsername,
  queryProfileByUser,
  queryUser,
} from "../graphql/user";
import { GetServerSideProps } from "next/types";
import { graphQLServer } from "../plugins/graphql.plugin";
import { getCookies } from "cookies-next/server";
import { useStoreUser } from "../store/user";

import { Center } from "@astryxdesign/core/Center";
import { Stack } from "@astryxdesign/core/Stack";
import { useRouter } from "next/router";
import { ProfilePageJsonLd } from "next-seo";
import dynamic from "next/dynamic";
const DynamicWidgetMessage = dynamic(
  () => import("../components/Messages/WidgetMessage"),
  {
    ssr: false,
  }
);
interface IProps {
  userData: User;
  user: User;
  profileData: ProfileUser;
}
const Profile: React.FC<IProps> = ({ userData, user, profileData }) => {
  const [updateUserData, setUpdateUserData] = useState(false);
  const { setUser } = useStoreUser();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [setUser, user]);
  useEffect(() => {
    if (updateUserData) {
      router.reload();
    }
  }, [router, updateUserData]);

  if (userData) {
    return (
      <>
        <ProfilePageJsonLd
          mainEntity={{
            name: userData.username,
            url: `${process.env.NEXT_PUBLIC_URL_APP}/${userData.username}`,
            sameAs: ["http://www.facebook.com/ptn1411"],
          }}
        />

        <Navigation />
        <Center axis="horizontal">
          <Stack width="100%" maxWidth={896} gap={4} paddingBlockStart={2}>
            <UserProfile
              userData={userData}
              profileData={profileData}
              setUpdateUserData={setUpdateUserData}
            />
            <DynamicWidgetMessage />
          </Stack>
        </Center>
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
    const cookie = await getCookies({ req: context.req });
    const accessToken = cookie[process.env.NEXT_PUBLIC_COOKIE_NAME as string];
    if (accessToken) {
      const res = await graphQLServer(
        context.req.headers.cookie,
        accessToken
      ).request(queryGetUserByUsername, {
        username: username as string,
      });
      const resProfile = await graphQLServer(
        context.req.headers.cookie,
        accessToken
      ).request(queryProfileByUser, {
        username: username as string,
      });
      const resUser = await graphQLServer(
        context.req.headers.cookie,
        accessToken
      ).request(queryUser);
      return {
        props: {
          userData: res.getUser.user,
          user: resUser.user.user,
          profileData: resProfile.profileByUser.profile,
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
