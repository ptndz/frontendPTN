import React, { useEffect } from "react";
import Navigation from "../components/Share/Navigation";
import AllFriends from "../components/FriendsCom/AllFriends";
import { useStoreUser } from "../store/user";
import Login from "../components/Auth/Login";

import { GetServerSideProps } from "next";
import { User } from "../gql/graphql";
import Head from "next/head";
import { generateNextSeo } from "next-seo/pages";
import dynamic from "next/dynamic";
import { getAuthenticatedUser } from "../lib/pages-router-auth";
import { Center } from "@astryxdesign/core/Center";
import { Stack } from "@astryxdesign/core/Stack";

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
      {generateNextSeo({ title: "Friends", description: "Chào mừng bạn đến với tính năng kết bạn của mạng xã hội của chúng tôi! Tính năng này giúp bạn kết nối với bạn bè và tìm kiếm những người có sở thích và sự quan tâm giống bạn. Với tính năng kết bạn, bạn sẽ dễ dàng mở rộng mạng lưới xã hội của mình và tạo ra những kết nối mới. Hãy khám phá tính năng kết bạn và bắt đầu kết nối với những người bạn mới ngay hôm nay! Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với chúng tôi. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!", canonical: "https://phamthanhnam.com/friends" })}
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
      <Center axis="horizontal">
        <Stack width="100%" maxWidth={1024} paddingBlockStart={2}>
          <AllFriends />
          <DynamicWidgetMessage />
        </Stack>
      </Center>
    </>
  );
};

export default Friends;
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const user = await getAuthenticatedUser(context);

    if (user) {
      return {
        props: {
          userData: user,
        },
      };
    }
  } catch (error) {}

  return {
    redirect: {
      destination: "/login",
      permanent: false,
    },
  };
};
