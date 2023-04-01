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
import { Post, User } from "../../gql/graphql";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { useInfiniteQuery } from "@tanstack/react-query";
import { graphql } from "../../gql";
import moment from "moment";
import Link from "next/link";
import { queryGetPostsUserByUserName } from "../../graphql/post";

interface IProps {
  userData: User;
  setUpdateUserData: any;
}

const UserProfile: React.FC<IProps> = ({ userData, setUpdateUserData }) => {
  const router = useRouter();
  const userName = router.query.username as string;
  const [deletePost, setDeletePost] = useState(false);
  const { user } = useStoreUser();
  const [bookmarkedPostsId, setBookmarkedPostsId] = useState<string[]>();
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [statusFriends, setStatusFriends] = useState<string>("");
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

  const getPost = async (pageParam: string) => {
    const resPost = await graphQLClient.request(queryGetPostsUserByUserName, {
      username: userName,
    });

    return resPost.getPostsUserByUserName;
  };
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery(
      ["userPosts"],
      ({ pageParam = "01-01-9999" }) => getPost(pageParam),
      {
        getNextPageParam: (lastPage, _allPages) => {
          const time = lastPage;

          return time;
        },
      }
    );

  const loadMoreRef = useRef() as React.RefObject<HTMLButtonElement>;

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
      const res = await axios.get(`/friends/${user.id}/${userData.id}`);
      if (res.data.code === 200) {
        setStatusFriends(
          res.data.friends.status ? res.data.friends.status.toString() : null
        );
      }
    };
    if (userData.id !== user.id) {
      fetchFriends();
    }
  }, [userData, user]);
  const handleFriendRequest = async (status: string) => {};
  const renderFriendsButton = () => {
    if (statusFriends === "true") {
      return (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleFriendRequest("unfriend")}>
          Unfriend
        </button>
      );
    }
    if (statusFriends === "false") {
      return (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => handleFriendRequest("accept")}>
          Accept Friend
        </button>
      );
    }
    return (
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => handleFriendRequest("add")}>
        Add Friends
      </button>
    );
  };
  return (
    <>
      <div className="drop-shadow-sm p-5 bg-white dark:bg-black rounded-2xl">
        <div className="">
          <Image
            className="rounded-2xl object-content"
            src={"https://i.ibb.co/pWc2Ffd/u-bg.jpg"}
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
                src={userData.avatar || "https://i.ibb.co/5kdWHNN/user-12.png"}
                alt="user profile photo"
                width={100}
                height={100}
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <div className="ml-6">
              <div className="font-bold text-lg text-center flex items-center justify-center">
                {userData.fullName}&ensp;
                <a className="group relative inline-block">
                  <TiTick className="text-[20px] text-white rounded-full bg-sky-500" />
                  <span className="absolute hidden group-hover:flex -top-2 -right-3 translate-x-full w-48 px-2 py-1 bg-gray-700 rounded-lg text-center text-white text-sm before:content-[''] before:absolute before:top-1/2  before:right-[100%] before:-translate-y-1/2 before:border-8 before:border-y-transparent before:border-l-transparent before:border-r-gray-700">
                    day la tich xanh ne
                  </span>
                </a>
              </div>

              <div className="text-xs font-medium	text-gray-400 ">
                <a href={`mailto:${userData.email}`}>{userData.email}</a>
              </div>
            </div>
          </div>
          <div className="">
            {userData.id === user.id ? (
              <button
                className="bg-green-500 hover:bg-green-700	text-white font-bold text-xs p-3 rounded-md "
                onClick={() => setOpenProfileModal(true)}>
                Edit profile
              </button>
            ) : userData.id === user.id ? (
              <button id="edit-profile" className="hidden"></button>
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
            <div className="flex items-center">
              <i className="fa-solid fa-graduation-cap"></i>
              <span className="ml-3">Went to sss</span>
            </div>
            <div className="flex items-center py-3">
              <i className="fa-solid fa-house-chimney"></i>
              <span className="ml-3">Lives in sss</span>
            </div>
            <div className="flex items-center py-3">
              <i className="fa-solid fa-location-dot" />
              <span className="ml-3">From sss</span>
            </div>
            <div className="flex items-center py-3">
              <i className="fa-solid fa-heart"></i>
              <span className="ml-3">ssss</span>
            </div>
            <div className="flex items-center py-3">
              <i className="fa-solid fa-clock"></i>
              <span className="ml-3">
                Joined {moment(user.createAt).format()}
              </span>
            </div>
            {userData.id === user.id ? (
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
          {userData.id === user.id && <CreatePost setNewPost={setNewPost} />}
          {data?.pages
            .map((data, i) => (
              <Fragment key={i}>
                {data?.posts &&
                  data?.posts.map((post) => (
                    <SinglePost
                      loading={undefined}
                      bookmarkedPostsId={bookmarkedPostsId || []}
                      key={post.uuid}
                      post={post}
                      deletePost={deletePost}
                      setDeletePost={setDeletePost}
                      isBookmarkPage={undefined}
                      setRemovedBookmarked={undefined}
                    />
                  ))}
              </Fragment>
            ))
            .reverse()}

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
        data={user}
        openDetailsModal={openDetailsModal}
        setOpenDetailsModal={setOpenDetailsModal}
        setUpdateUserData={setUpdateUserData}
      />
    </>
  );
};

export default UserProfile;
