import React, { useEffect, useState } from "react";
import Navigation from "../components/Share/Navigation";
import UserProfile from "../components/userProfile/UserProfile";
import { useRouter } from "next/router";
import { graphql } from "../gql";
import { graphQLClient } from "../plugins/graphql.plugin";
import { Theme, toast } from "react-toastify";
import { useStoreTheme } from "../store/state";
import { User } from "../gql/graphql";

const Profile = () => {
  const router = useRouter();
  const userName = router.query.username as string;
  const [userData, setUserData] = useState<User>();
  const [updateUserData, setUpdateUserData] = useState(false);
  const { theme } = useStoreTheme();
  useEffect(() => {
    const queryUser = graphql(`
      query getUser($username: String!) {
        getUser(username: $username) {
          code
          success
          message
          user {
            id
            fullName
            lastName
            firstName
            username
            email
            avatar
            phone
            birthday
            sex
            createAt
            updateAt
          }
          errors {
            message
            field
          }
        }
      }
    `);
    const fetchData = async () => {
      const res = await graphQLClient.request(queryUser, {
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
        if (res.getUser.user) {
          setUserData(res.getUser.user);
        }
      }
    };
    fetchData();
  }, [userName, updateUserData, theme]);

  return (
    <>
      <Navigation />
      {userData ? (
        <div className="max-w-4xl mx-auto gap-4 bg-gray-100 dark:bg-zinc-900 pt-2 w-full ">
          <UserProfile
            userData={userData}
            setUpdateUserData={setUpdateUserData}
          />
        </div>
      ) : (
        router.push("/404")
      )}
    </>
  );
};

export default Profile;
