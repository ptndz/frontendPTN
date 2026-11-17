import LeftSideBar from "../components/Home/LeftSideBar";
import MiddleLeftBar from "../components/Home/MiddleLeftBar";
import RightSideBar from "../components/Home/RightSideBar";
import Navigation from "../components/Share/Navigation";

import { useStoreUser } from "../store/user";

import { useEffect } from "react";
import { getAuthenticatedUser } from "../lib/pages-router-auth";
import { GetServerSideProps } from "next";
import { User } from "../gql/graphql";
import dynamic from "next/dynamic";
import { Grid } from "@astryxdesign/core/Grid";
import { GridSpan } from "@astryxdesign/core/Grid";
import { VStack } from "@astryxdesign/core/VStack";

const DynamicWidgetMessage = dynamic(
  () => import("../components/Messages/WidgetMessage"),
  {
    ssr: false,
  }
);

interface IProps {
  userData: User;
}

const Home: React.FC<IProps> = ({ userData }) => {
  const { setUser } = useStoreUser();

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [setUser, userData]);

  return (
    <VStack gap={0} className="bg-paper">
      <Navigation />
      <Grid columns={12} gap={6} maxWidth={1560} className="mx-auto mt-2 w-full">
        <GridSpan className="col-span-3 hidden lg:block h-[89vh] overflow-y-scroll scrollbar scrollbar-hide hover:scrollbar-default px-1">
          <LeftSideBar />
        </GridSpan>
        <GridSpan className="col-span-12 lg:col-span-6 w-full mx-auto h-[89vh] scrollbar-hide overflow-y-scroll scrollbar scroll-ml-5 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
          {/* Desktop: w-full để cột giữa lấp đầy track grid — trước đây
              chỉ có mx-auto + max-w nên VStack co về fit-content 459px
              ở mọi cỡ desktop (kẹp giữa 2 khoảng trống trong cột).
              lg:max-w-3xl = 768px: 626px ở 1280, 706px ở 1440,
              768px ở 1920. Dưới lg giữ nguyên như cũ (mobile không đổi). */}
          <VStack gap={0} className="col-span-12 mx-auto max-w-2xl lg:w-full lg:max-w-3xl">
            <MiddleLeftBar />
          </VStack>
        </GridSpan>
        <GridSpan className="col-span-3 hidden lg:block h-[89vh] overflow-y-scroll scrollbar scrollbar-hide hover:scrollbar-default px-1">
          <RightSideBar />
        </GridSpan>
      </Grid>
      <DynamicWidgetMessage />
    </VStack>
  );
};
export default Home;
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
