import React, { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ProfileModal from "./ProfileModal";
import AboutModal from "./AboutModal";
import axios from "axios";
import { TiTick } from "react-icons/ti";
import SinglePost from "../Home/SinglePost";
import { useRouter } from "next/router";
import "react-responsive-modal/styles.css";
import CreatePost from "../Home/CreatePost";
import { useStoreUser } from "../../store/user";
import { User, ProfileUser } from "../../gql/graphql";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { useInfiniteQuery } from "@tanstack/react-query";

import moment from "moment";
import Link from "next/link";
import { queryGetPostsUserByUserName } from "../../graphql/post";
import { FriendRequestStatus } from "../../types/friends";
import Head from "next/head";

interface IProps {
  userData: User;
  setUpdateUserData: (updateUserData: boolean) => void;
  profileData: ProfileUser;
}
interface IFriendRequestStatus extends FriendRequestStatus {
  id: number;
}
const UserProfile: React.FC<IProps> = ({
  userData,
  setUpdateUserData,
  profileData,
}) => {
  const router = useRouter();

  const [deletePost, setDeletePost] = useState(false);
  const { user } = useStoreUser();
  const [bookmarkedPostsId, setBookmarkedPostsId] = useState<string[]>();
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [statusFriends, setStatusFriends] = useState<IFriendRequestStatus>();
  const [newPost, setNewPost] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/bookmark/all");
      if (res.data.status === 200) {
        setBookmarkedPostsId(res.data.bookmarkedPostsId || []);
      }
    };
    fetchData();
  }, []);

  const getPost = async (pageParam: number) => {
    const username = userData.username;
    const resPost = await graphQLClient.request(queryGetPostsUserByUserName, {
      username: username,
      page: pageParam,
      limit: 10,
    });

    return resPost.getPostsUserByUserName;
  };
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    remove,
  } = useInfiniteQuery(
    ["userPosts"],
    ({ pageParam = 1 }) => getPost(pageParam),
    {
      getNextPageParam: (lastPage, _allPages) => {
        const page = lastPage?.page ? lastPage.page + 1 : 1;
        return page;
      },
    }
  );

  const loadMoreRef = useRef() as React.RefObject<HTMLButtonElement>;

  useEffect(() => {
    fetchNextPage();
  }, [fetchNextPage, newPost]);

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

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await axios.get(`/friends/status/${userData.id}`);

      if (res.data.status) {
        setStatusFriends({
          id: res.data.id,
          status: res.data.status,
        });
      }
    };
    if (userData?.id !== user.id) {
      fetchFriends();
    }
  }, [userData, user]);
  useEffect(() => {
    remove();
    return () => {
      remove();
    };
  }, [router.pathname, remove]);
  const renderFriendsButton = () => {
    const componentStatus = [
      {
        status: "not-sent",
        component: (
          <button
            className="bg-blue-500 hover:bg-blue-700	text-white font-bold text-xs p-3 rounded-md"
            onClick={async () => {
              const res = await axios.post(`/friends/send/${userData.id}`);

              if (res.data.status) {
                setStatusFriends({
                  id: res.data.id,
                  status: res.data.status,
                });
              }
            }}>
            Add Friends
          </button>
        ),
      },
      {
        status: "pending",
        component: (
          <button
            className="bg-yellow-300 hover:bg-yellow-700	text-white font-bold text-xs rounded-md inline-block p-3"
            onClick={async () => {
              const res = await axios.put(
                `/friends/response/${statusFriends?.id}`,
                {
                  status: "declined",
                }
              );
              if (res.data.status) {
                setStatusFriends({
                  id: res.data.id,
                  status: res.data.status,
                });
              }
            }}>
            Cancel
          </button>
        ),
      },
      {
        status: "accepted",
        component: (
          <div className="flex flex-row justify-center space-x-4">
            <Link
              href="/messenger"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50">
              Messages
            </Link>
            <button className="px-4 py-2 text-blue-500 bg-white border border-blue-500 rounded hover:text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50">
              Friends
            </button>
          </div>
        ),
      },
      {
        status: "declined",
        component: (
          <button
            className="bg-rose-700 hover:bg-rose-900	text-white font-bold text-xs p-3 rounded-md"
            onClick={async () => {
              const res = await axios.put(
                `/friends/response/${statusFriends?.id}`,
                {
                  status: "pending",
                }
              );
              if (res.data.status) {
                setStatusFriends({
                  id: res.data.id,
                  status: res.data.status,
                });
              }
            }}>
            Add Friends
          </button>
        ),
      },
      {
        status: "waiting-for-current-user-response",
        component: (
          <button
            className="bg-green-300 hover:bg-green-700	text-white font-bold text-xs p-3 rounded-md "
            onClick={async () => {
              const res = await axios.put(
                `/friends/response/${statusFriends?.id}`,
                {
                  status: "accepted",
                }
              );
              if (res.data.status) {
                setStatusFriends({
                  id: res.data.id,
                  status: res.data.status,
                });
              }
            }}>
            Accept requests
          </button>
        ),
      },
    ];

    return (
      componentStatus.find((item) => item.status === statusFriends?.status)
        ?.component || null
    );
  };
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <div className="drop-shadow-sm p-5 bg-white dark:bg-black rounded-2xl">
        <div className="">
          <Image
            className="rounded-2xl object-content"
            src={userData?.coverImage || "/images/user-avatar.png"}
            width={1000}
            objectFit="cover"
            height={300}
            alt="user cover photo"
          />
        </div>
        <div className="flex justify-between pt-2 pb-5">
          <div className=" flex ">
            <div className="-mt-12 ml-5">
              <Image
                src={userData?.avatar || "/images/user-avatar.png"}
                alt="user profile photo"
                width={100}
                height={100}
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <div className="ml-6">
              <div className="font-bold text-lg text-center flex items-center justify-center">
                {userData?.fullName}&ensp;
                <a className="group relative inline-block">
                  <TiTick className="text-[20px] text-white rounded-full bg-sky-500" />
                  <span className="absolute hidden group-hover:flex -top-2 -right-3 translate-x-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm before:content-[''] before:absolute before:top-1/2  before:right-[100%] before:-translate-y-1/2 before:border-8 before:border-y-transparent before:border-l-transparent before:border-r-gray-700">
                    day la tich xanh ne
                  </span>
                </a>
              </div>

              <div className="text-xs font-medium	text-gray-400 ">
                <a href={`mailto:${userData?.email}`}>{userData?.email}</a>
              </div>
            </div>
          </div>
          <div className="">
            {userData?.id === user.id ? (
              <button
                className="bg-green-500 hover:bg-green-700	text-white font-bold text-xs p-3 rounded-md "
                onClick={() => setOpenProfileModal(true)}>
                Edit profile
              </button>
            ) : (
              renderFriendsButton()
            )}
          </div>
        </div>
        <div className="flex">
          <button>
            <Link href="/friends" className="pr-8 pt-3 font-semibold">
              Post
            </Link>
          </button>
          <button>
            <Link href="/friends" className="pr-8 pt-3 font-semibold">
              Friends
            </Link>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 bg-gray-100 dark:bg-zinc-900 pt-3">
        <div className="md:col-span-4 sm:col-span-12 col-span-12 ">
          <div className="drop-shadow-sm bg-white dark:bg-black p-5 rounded-xl">
            <h2 className="text-lg font-semibold pb-3">About</h2>
            {profileData?.education ? (
              <div className="flex items-center">
                <i className="fa-solid fa-graduation-cap"></i>
                <span className="ml-3">Went to {profileData.education}</span>
              </div>
            ) : null}

            {profileData?.city ? (
              <div className="flex items-center py-3">
                <i className="fa-solid fa-house-chimney"></i>
                <span className="ml-3">Lives in {profileData.city}</span>
              </div>
            ) : null}
            {profileData?.from ? (
              <div className="flex items-center py-3">
                <i className="fa-solid fa-location-dot" />
                <span className="ml-3">From {profileData.from}</span>
              </div>
            ) : null}
            {profileData?.relationship ? (
              <div className="flex items-center py-3">
                <i className="fa-solid fa-heart"></i>
                <span className="ml-3">{profileData.relationship}</span>
              </div>
            ) : null}

            <div className="flex items-center py-3">
              <i className="fa-solid fa-clock"></i>
              <span className="ml-3">
                Joined {moment(user.createAt).fromNow()}
              </span>
            </div>
            {userData?.id === user.id ? (
              <button
                className="w-full bg-gray-200 dark:bg-zinc-800 hover:dark:bg-zinc-700 hover:bg-slate-300 font-semibold rounded-md text-gray-700 dark:text-white mt-3 py-2"
                onClick={() => setOpenDetailsModal(true)}>
                Edit Details
              </button>
            ) : (
              <button className="hidden w-full"></button>
            )}
          </div>
        </div>
        <div className="md:col-span-8 sm:col-span-12 col-span-12 ">
          {/* create post */}
          {userData?.id === user.id && <CreatePost setNewPost={setNewPost} />}
          {data?.pages.map((data) => (
            <Fragment key={data?.page}>
              {data?.posts &&
                data?.posts.map((post) => (
                  <SinglePost
                    loading={false}
                    bookmarkedPostsId={bookmarkedPostsId || []}
                    key={post.uuid}
                    post={post}
                    deletePost={deletePost}
                    setDeletePost={setDeletePost}
                    isBookmarkPage={false}
                  />
                ))}
            </Fragment>
          ))}

          <div>
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
          <div>{isFetching && !isFetchingNextPage ? "Fetching..." : null}</div>
        </div>
      </div>
      {/* Edit Profile Modal */}
      <ProfileModal
        data={user}
        open={openProfileModal}
        setOpenProfileModal={setOpenProfileModal}
        setUpdateUserData={setUpdateUserData}
      />
      {/* Edit About Modal */}
      <AboutModal
        data={profileData}
        openDetailsModal={openDetailsModal}
        setOpenDetailsModal={setOpenDetailsModal}
        setUpdateUserData={setUpdateUserData}
      />
    </>
  );
};

export default UserProfile;
