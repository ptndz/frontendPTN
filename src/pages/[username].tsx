import React, { useEffect, useState } from "react";
import Navigation from "../components/Share/Navigation";
import UserProfile from "../components/userProfile/UserProfile";
import { useRouter } from "next/router";
import { graphql } from "../gql";
import { graphQLClient } from "../plugins/graphql.plugin";
import { Theme, toast } from "react-toastify";
import { useStoreTheme } from "../store/state";
import { User } from "../gql/graphql";
import Error from "./404";
import { queryGetUser } from "../graphql/user";

const Profile = () => {
  const router = useRouter();
  const userName = router.query.username as string;

  const [userData, setUserData] = useState<User>();
  const [updateUserData, setUpdateUserData] = useState(false);
  const { theme } = useStoreTheme();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await graphQLClient.request(queryGetUser, {
          username: userName,
        });
        if (res.getUser.code === 400) {
          toast.error(res.getUser.message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            theme: theme ? (theme as Theme) : "light",
          });
        }
        if (res.getUser.code === 200) {
          console.log(res.getUser);

          if (res.getUser.user) {
            setUserData(res.getUser.user);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (userName) {
      fetchData();
    }
  }, [userName, updateUserData, theme]);
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
