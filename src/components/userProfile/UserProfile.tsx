import React, { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ProfileModal from "./ProfileModal";
import AboutModal from "./AboutModal";
import axios from "axios";

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

interface IProps {
  userData: User;
  setUpdateUserData: any;
}

const UserProfile: React.FC<IProps> = ({ userData, setUpdateUserData }) => {
  const router = useRouter();
  const userName = router.query.username;
  const [deletePost, setDeletePost] = useState(false);
  const { user } = useStoreUser();

  const [isLike, setIsLike] = useState(false);

  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [newPost, setNewPost] = useState(false);

  const queryPost = graphql(`
    query posts {
      posts {
        code
        success
        message
        posts {
          uuid
          content
          createAt
          updateAt
          shares
          images
          user {
            avatar
            username
            fullName
          }
          likes {
            id
            reactions
            user {
              avatar
              username
              fullName
            }
          }
          comments {
            id
            content
            user {
              avatar
              username
              fullName
            }
          }
        }
      }
    }
  `);
  const getPost = async (pageParam: string) => {
    const resPost = await graphQLClient.request(queryPost);

    return resPost.posts;
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
    console.log(user);
  }, [user]);
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
      {/* Profile banner */}
      <div className="drop-shadow-sm p-5 bg-white dark:bg-black rounded-2xl">
        <div className="">
          <Image
            className="rounded-2xl object-content"
            src={user.avatar || "https://i.ibb.co/pWc2Ffd/u-bg.jpg"}
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
                src={user.avatar || "https://i.ibb.co/5kdWHNN/user-12.png"}
                alt="user profile photo"
                width={100}
                height={100}
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <div className="ml-6">
              <div className="font-bold text-lg ">{user.fullName}</div>
              <div className="text-xs font-medium	text-gray-400 ">
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </div>
            </div>
          </div>
          <div className="">
            {user.email === user.email ? (
              <button
                className="bg-green-500 hover:bg-green-700	text-white font-bold text-xs p-3 rounded-md "
                onClick={() => setOpenProfileModal(true)}>
                Edit profile
              </button>
            ) : (
              <button id="edit-profile" className="hidden"></button>
            )}
          </div>
        </div>
        {/* <div className="flex ">
          <button>
            <a className="pr-8 pt-3 font-semibold">Post</a>
          </button>
          <Link href="/friends">
            <a className="pr-8 pt-3 font-semibold">Friends</a>
          </Link>
        </div> */}
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
            {user.email === user.email ? (
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
          {user.email === user.email && <CreatePost setNewPost={setNewPost} />}
          {data?.pages
            .map((data, i) => (
              <Fragment key={i}>
                {data?.posts &&
                  data?.posts.map((post) => (
                    <SinglePost
                      loading={undefined}
                      bookmarkedPostsId={undefined}
                      key={post.uuid}
                      post={post}
                      isLike={isLike}
                      setIsLike={setIsLike}
                      deletePost={deletePost}
                      setDeletePost={setDeletePost}
                      setController={undefined}
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
