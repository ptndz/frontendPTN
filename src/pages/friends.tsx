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
import Head from "next/head";
import { NextSeo } from "next-seo";
import dynamic from "next/dynamic";

const DynamicWidgetMessage = dynamic(
  () => import("../components/Messages/WidgetMessage"),
  {
    ssr: false,
  }
);

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

  return (
    <>
      <NextSeo
        title="Friends"
        description="Chào mừng bạn đến với tính năng kết bạn của mạng xã hội của chúng tôi! Tính năng này giúp bạn kết nối với bạn bè và tìm kiếm những người có sở thích và sự quan tâm giống bạn. Với tính năng kết bạn, bạn sẽ dễ dàng mở rộng mạng lưới xã hội của mình và tạo ra những kết nối mới. Hãy khám phá tính năng kết bạn và bắt đầu kết nối với những người bạn mới ngay hôm nay! Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với chúng tôi. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!"
        canonical="https://phamthanhnam.com/friends"
      />
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>

      <Navigation />
      <div className="pt-2 w-full ">
        <div className="max-w-5xl w-full mx-auto">
          <AllFriends />
        </div>
        <DynamicWidgetMessage />
      </div>
    </>
  );
};

export default Friends;
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
