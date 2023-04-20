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
import { graphQLClient, graphQLServer } from "../plugins/graphql.plugin";
import { getCookies } from "cookies-next";
import { useStoreUser } from "../store/user";
import { useRouter } from "next/router";

interface IProps {
  userData: User;
  user: User;
  profileData: ProfileUser;
  username: string;
}
const Profile: React.FC<IProps> = ({
  userData,
  user,
  profileData,
  username,
}) => {
  const [updateUserData, setUpdateUserData] = useState(false);
  const { setUser } = useStoreUser();
  const [dataProfile, setDataProfile] = useState<ProfileUser>();
  const [dataUser, setDataUser] = useState<User>();
  useEffect(() => {
    if (userData) {
      setDataUser(userData);
    }
    if (profileData) {
      setDataProfile(profileData);
    }
  }, [setUser, userData, profileData]);

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [setUser, user]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await graphQLClient.request(queryGetUserByUsername, {
        username: username as string,
      });

      const resProfile = await graphQLClient.request(queryProfileByUser, {
        username: username as string,
      });
      if (res.getUser.user && resProfile.profileByUser.profile) {
        setDataProfile(resProfile.profileByUser.profile);
        setDataUser(res.getUser.user);
      }
    };
    fetchData();
  }, [username, updateUserData]);
  if (userData) {
    return (
      <>
        <Navigation />
        <div className="max-w-4xl mx-auto gap-4 bg-gray-100 dark:bg-zinc-900 pt-2 w-full ">
          <UserProfile
            userData={dataUser as User}
            profileData={dataProfile as ProfileUser}
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
          username: username,
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
