import React, { useEffect, useRef, useState } from "react";
import { TPostView, IPostsData } from "../../types/post";
import PostContainer from "../../components/container/PostContainer";
import CreatePostBox from "../../components/post/CreatePostBox";
import ProfilePageLayout from "../../components/layouts/ProfilePageLayout";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useStoreOpenModal } from "../../store/state";
import CreatePostModal from "../../components/post/CreatePostModal";
const ProfilePage: React.FC = () => {
  const [postsView, setPostsView] = useState<TPostView>("listView");
  const { open } = useStoreOpenModal();
  const getPost = async (pageParam: string) => {
    const resPost = await axios.get("/post?time=" + pageParam);
    return resPost.data;
  };
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery(
      ["userPosts"],
      ({ pageParam = "01-01-9999" }) => getPost(pageParam),
      {
        getNextPageParam: (lastPage, _allPages) => {
          const time = lastPage.time;

          return time;
        },
      }
    );

  const loadMoreRef = useRef() as React.RefObject<HTMLButtonElement>;
  const router = useRouter();
  useEffect(() => {
    open
      ? (document.body.className = "openModalBlockScroll")
      : document.body.classList.remove("openModalBlockScroll");
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
  }, [hasNextPage, router, fetchNextPage, open]);
  return (
    <ProfilePageLayout>
      <div className="w-full h-full">
        <div className="w-full h-auto shadow bg-white rounded-md">
          <div className="max-w-6xl h-full mx-auto bg-white p-2">
            <div
              className="h-96 max-h-96 w-full rounded-lg relative"
              style={{
                backgroundImage: `url('https://random.imagecdn.app/1920/1080')`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}>
              <div
                className="absolute  w-full flex items-center justify-center"
                style={{ bottom: "-15px" }}>
                <div className="w-44 h-44 rounded-full bg-gray-300 border-4 border-white">
                  <Image
                    className="w-full h-full rounded-full"
                    src="https://random.imagecdn.app/250/250"
                    alt="dp"
                    width={"250"}
                    height={"250"}
                  />
                </div>
                <div className="absolute" style={{ bottom: 30, right: 30 }}>
                  <button className="focus:outline-none px-3 py-2 hover:bg-gray-50 font-semibold bg-white rounded-md">
                    <i className="fas fa-camera mr-2"></i>Edit Cover Photo
                  </button>
                </div>
              </div>
            </div>
            <div className="max-w-5xl h-full mx-auto">
              <div className="flex flex-col space-y-2 mt-3 items-center justify-center pb-3 border-b-2">
                <p className="text-4xl font-bold">Saiful Islam Shihab</p>
                <p className="text-sm text-gray-500">Software Engineer</p>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <div className="flex mb-2 items-center space-x-2">
                  <button className="py-3 px-2 hover:bg-gray-100 rounded-md font-semibold focus:outline-none">
                    Posts
                  </button>
                  <button className="py-3 px-2 hover:bg-gray-100 rounded-md font-semibold focus:outline-none">
                    About
                  </button>
                  <button className="py-3 px-2 hover:bg-gray-100 rounded-md font-semibold focus:outline-none">
                    Friends
                  </button>
                  <button className="py-3 px-2 hover:bg-gray-100 rounded-md font-semibold focus:outline-none">
                    Photos
                  </button>
                  <button className="py-3 px-2 hover:bg-gray-100 rounded-md font-semibold focus:outline-none">
                    Story Archrive
                  </button>
                  <button className="py-3 px-2 hover:bg-gray-100 rounded-md font-semibold focus:outline-none">
                    Videos
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 rounded-md bg-primary hover:bg-blue-600 text-white font-semibold focus:outline-none">
                    <i className="fas fa-plus-circle  mr-2"></i>Add to Story
                  </button>
                  <button className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold focus:outline-none">
                    <i className="fas fa-pen mr-2"></i>Edit Profile
                  </button>
                  <button className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 font-semibold focus:outline-none">
                    <i className="fas fa-ellipsis-h"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* After bio content */}
        <div className="max-w-6xl h-full mx-auto my-3">
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2">
              <div className="bg-white rounded-lg p-3 text-sm text-gray-600 shadow">
                <div className="mb-2 ">
                  <p className="font-bold text-xl text-gray-800">Intro</p>
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fas fa-briefcase"></i>
                    </span>
                    <p>
                      Full Stack Web Developer at{" "}
                      <span className="font-semibold">Fiverr</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fas fa-graduation-cap"></i>
                    </span>
                    <p>
                      Studiend B.Sc in SWE at{" "}
                      <span className="font-semibold">
                        Daffodil International University
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fas fa-home"></i>
                    </span>
                    <p>
                      Lives in <span className="font-semibold">Dhaka</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fas fa-map-marker-alt"></i>
                    </span>
                    <p>
                      From{" "}
                      <span className="font-semibold">
                        Chandpur, Chittagong, Bangladesh
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fas fa-heart"></i>
                    </span>
                    <p>
                      <span className="font-semibold">Single</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fab fa-facebook"></i>
                    </span>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={"https://facebook.com/saifulshihab"}>
                      <p>saifulshihab</p>
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fab fa-instagram"></i>
                    </span>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={"https://instagram.com/_shiha6"}>
                      <p>_shiha6</p>
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fab fa-twitter"></i>
                    </span>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={"https://twitter.com/ShihabSWE"}>
                      <p>ShihabSWE</p>
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fab fa-github"></i>
                    </span>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={"https://github.com/saifulshihab"}>
                      <p>saifulshihab</p>
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>
                      <i className="fab fa-behance"></i>
                    </span>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={"https://www.behance.net/saifulis1am"}>
                      <p>saifulis1am</p>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-3">
              {/* Create post */}
              <CreatePostBox />
              {/* post filter box */}
              <div className="bg-white rounded-md shadow p-2 mt-4 px-3 text-sm">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <p className="text-xl text-gray-700 font-bold">Posts</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold focus:outline-none">
                      <i className="fas fa-sliders-h mr-2"></i>Filters
                    </button>
                    <button className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold focus:outline-none">
                      <i className="fas fa-cog mr-2"></i>Manage Posts
                    </button>
                  </div>
                </div>
                <div className="flex space-x-3 text-gray-500 mt-1 -mb-1">
                  <button
                    className={`font-semibold flex-1 h-8 focus:outline-none justify-center space-x-2 hover:bg-gray-100 rounded-md ${
                      postsView === "listView" ? "bg-gray-200" : undefined
                    }`}
                    onClick={() => setPostsView("listView")}>
                    <i className="fas fa-bars mr-2"></i>List View
                  </button>
                  <button
                    className={`font-semibold flex-1 h-8 focus:outline-none justify-center space-x-2 hover:bg-gray-100 rounded-md  ${
                      postsView === "gridView" ? "bg-gray-200" : undefined
                    }`}
                    onClick={() => setPostsView("gridView")}>
                    <i className="fas fa-th-large mr-2"></i>Grid View
                  </button>
                </div>
              </div>

              {/* user posts */}
              <PostContainer
                postsData={data as unknown as IPostsData}
                postsView={postsView}
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
          </div>
        </div>
      </div>
      {open ? <CreatePostModal /> : ""}
    </ProfilePageLayout>
  );
};

export default ProfilePage;
