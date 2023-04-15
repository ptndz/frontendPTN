import React, { useEffect } from "react";
import MessagingMain from "../components/Messages";

import Login from "../components/Auth/Login";
import { GetServerSideProps } from "next";
import { queryUser } from "../graphql/user";
import { graphQLServer } from "../plugins/graphql.plugin";
import { User } from "../gql/graphql";
import { getCookies } from "cookies-next";
import { useStoreUser } from "../store/user";
interface IProps {
  userData: User;
}
const MessengerPage: React.FC<IProps> = ({ userData }) => {
  const { setUser } = useStoreUser();

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [setUser, userData]);
  if (userData) {
    return <MessagingMain />;
  } else {
    return <Login />;
  }
};

export default MessengerPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookie = getCookies({ req: context.req });
    const accessToken = cookie[process.env.NEXT_PUBLIC_COOKIE_NAME as string];
    if (accessToken) {
      const res = await graphQLServer(context.req.headers.cookie,accessToken).request(
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
