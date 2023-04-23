import React, { useEffect } from "react";
import MessagingMain from "../components/Messages";

import Login from "../components/Auth/Login";
import { GetServerSideProps } from "next";
import { queryUser } from "../graphql/user";
import { graphQLServer } from "../plugins/graphql.plugin";
import { User } from "../gql/graphql";
import { getCookies } from "cookies-next";
import { useStoreUser } from "../store/user";
import { NextSeo } from "next-seo";
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
    return (
      <>
        <NextSeo
          title="Messenger"
          description="Tính năng nhắn tin trên mạng xã hội cho phép người dùng gửi tin nhắn văn bản, hình ảnh, video và âm thanh cho nhau thông qua nền tảng của mạng xã hội đó. Người dùng có thể trò chuyện với bạn bè, gia đình, đồng nghiệp hoặc tìm kiếm và kết nối với những người mới trên mạng. Tính năng nhắn tin giúp người dùng tiết kiệm thời gian và tiền bạc so với việc gọi điện thoại hoặc gửi thư truyền thống. Ngoài ra, tính năng này còn cho phép người dùng gửi thông điệp và nhận phản hồi ngay lập tức, làm cho việc liên lạc trở nên nhanh chóng và thuận tiện hơn."
          canonical="https://phamthanhnam.com/messenger"
        />
        <MessagingMain />
      </>
    );
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
      const res = await graphQLServer(
        context.req.headers.cookie,
        accessToken
      ).request(queryUser);

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
