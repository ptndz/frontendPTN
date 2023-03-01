import axios from "axios";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { IProps, IPostsData } from "../types/post";
import { IStory } from "../types/stories";
import LeftSidebar from "../components/ui/sidebar/LeftSidebar";
import NewsFeedScreen from "../components/ui/NewsFeed";
import RightSidebar from "../components/ui/sidebar/RightSidebar";
import HomePageLayout from "../components/layouts/HomePageLayout";
import type { NextPageWithLayout } from "./_app";
import { useInfiniteQuery } from "@tanstack/react-query";
interface PageParamType {
  time: string;
  start: number;
}
const Home: NextPageWithLayout<IProps> = (props) => {
  const { storiesData } = props;
  const getPost = async (pageParam: PageParamType) => {
    const { time, start } = pageParam;
    const resPost = await axios.get(`/post?time=${time}&start=${start}`);
    return resPost.data;
  };
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery(
      ["posts"],
      ({
        pageParam = {
          time: "01/01/9999",
          start: 0,
        },
      }) => getPost(pageParam),
      {
        getNextPageParam: (lastPage, _allPages) => {
          const { time, start } = lastPage;

          return { time, start };
        },
      }
    );

  const loadMoreRef = useRef() as React.RefObject<HTMLButtonElement>;
  const router = useRouter();
  useEffect(() => {
    if (!hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver((entries) =>
      entries.forEach((entry) => entry.isIntersecting && fetchNextPage())
    );

    const el = loadMoreRef && loadMoreRef.current;

    if (!el) {
      return;
    }

    observer.observe(el);
  }, [hasNextPage, router, fetchNextPage]);
  return (
    <>
      <NextSeo title="Simple Usage Example" />
      <HomePageLayout>
        <div className="w-full h-full grid grid-cols-7">
          <div className="col-span-2 flex justify-start ml-2">
            <LeftSidebar />
          </div>
          <div className="col-span-3 h-full">
            <NewsFeedScreen
              storiesData={storiesData}
              postsData={data as unknown as IPostsData}
            />
            <div className="">
              <button
                ref={loadMoreRef}
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}>
                {isFetchingNextPage
                  ? "Loading more..."
                  : hasNextPage
                  ? "Load More"
                  : "Nothing more to load"}
              </button>
            </div>
            <div>
              {isFetching && !isFetchingNextPage ? "Fetching..." : null}
            </div>
          </div>
          <div className="col-span-2 flex justify-end pr-2">
            <RightSidebar />
          </div>
        </div>
      </HomePageLayout>
    </>
  );
};

export default Home;
export const getStaticProps = async () => {
  const resStories = await axios.get("/stories");
  return {
    props: {
      storiesData: resStories.data as IStory[],
    },
  };
};
