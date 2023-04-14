import React, { useEffect } from "react";
import Navigation from "../components/Share/Navigation";
import AllFriends from "../components/FriendsCom/AllFriends";
import { useStoreUser } from "../store/user";
import Login from "../components/Auth/Login";

import { getCookies } from "cookies-next";
import { GetServerSideProps } from "next";
import { queryUser } from "../graphql/user";
import { graphQLServer } from "../plugins/graphql.plugin";
import { User } from "../gql/graphql";
interface IProps {
  userData: User;
}
const Friends: React.FC<IProps> = ({ userData }) => {
  const { setUser } = useStoreUser();

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [setUser, userData]);

  if (userData) {
    return (
      <>
        <Navigation />
        <div className="pt-2 w-full ">
          <div className="max-w-5xl w-full mx-auto">
            <AllFriends />
          </div>
        </div>
      </>
    );
  } else {
    return <Login />;
  }
};

export default Friends;
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookie = getCookies({ req: context.req });
    if (cookie["ASP.NET_SessionId"]) {
      const res = await graphQLServer(context.req.headers.cookie).request(
        queryUser
      );

      if (res.user.user) {
        return {
          props: {
            userData: res.user.user,
          },
        };
      }
    }
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
