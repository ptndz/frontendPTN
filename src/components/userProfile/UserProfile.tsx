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
import { User, ProfileUser } from "../../gql/graphql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { useInfiniteQuery } from "@tanstack/react-query";
import moment from "moment";
import Link from "next/link";
import { queryGetPostsUserByUserName } from "../../graphql/post";
import { FriendRequestStatus } from "../../types/friends";
import {
  FiGraduationCap,
  FiHome,
  FiMapPin,
  FiHeart,
  FiClock,
  FiEdit3,
  FiMessageSquare,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";

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
    const resPost = await graphQLClient.request(queryGetPostsUserByUserName, {
      username: userData.username,
      page: pageParam,
      limit: 10,
    });
    if (graphQLClientErrorCheck(resPost)) {
      return resPost.getPostsUserByUserName;
    }
    return resPost.getPostsUserByUserName;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    remove,
  } = useInfiniteQuery({
    queryKey: ["userPosts"],
    queryFn: ({ pageParam }) => getPost(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const page = lastPage?.page ? lastPage.page + 1 : 1;
      return page;
    },
  });

  const loadMoreRef = useRef() as React.RefObject<HTMLButtonElement>;

  useEffect(() => {
    if (newPost) fetchNextPage();
  }, [fetchNextPage, newPost]);

  useEffect(() => {
    if (!hasNextPage) return;
    const observer = new IntersectionObserver((entries) =>
      entries.forEach((entry) => entry.isIntersecting && fetchNextPage())
    );
    const el = loadMoreRef && loadMoreRef.current;
    if (!el) return;
    observer.observe(el);
  }, [hasNextPage, router, fetchNextPage]);

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await axios.get(`/friends/status/${userData.id}`);
      if (res.data.status) {
        setStatusFriends({ id: res.data.id, status: res.data.status });
      }
    };
    if (userData?.id !== user.id) fetchFriends();
  }, [userData, user]);

  useEffect(() => {
    remove();
    return () => { remove(); };
  }, [router.pathname, remove]);

  const renderFriendsButton = () => {
    const btnBase = "inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold transition-colors";

    const statusMap: Record<string, React.ReactNode> = {
      "not-sent": (
        <button
          className={`${btnBase} bg-emerald-500 hover:bg-emerald-600 text-white`}
          onClick={async () => {
            const res = await axios.post(`/friends/send/${userData.id}`);
            if (res.data.status) setStatusFriends({ id: res.data.id, status: res.data.status });
          }}
        >
          <FiUserPlus className="w-4 h-4" />
          Add Friend
        </button>
      ),
      "pending": (
        <button
          className={`${btnBase} bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`}
          onClick={async () => {
            const res = await axios.put(`/friends/response/${statusFriends?.id}`, { status: "declined" });
            if (res.data.status) setStatusFriends({ id: res.data.id, status: res.data.status });
          }}
        >
          <FiUserX className="w-4 h-4" />
          Cancel Request
        </button>
      ),
      "accepted": (
        <div className="flex items-center gap-2">
          <Link
            href="/messenger"
            className={`${btnBase} bg-emerald-500 hover:bg-emerald-600 text-white`}
          >
            <FiMessageSquare className="w-4 h-4" />
            Message
          </Link>
          <button className={`${btnBase} bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`}>
            <FiUserCheck className="w-4 h-4" />
            Friends
          </button>
        </div>
      ),
      "declined": (
        <button
          className={`${btnBase} bg-emerald-500 hover:bg-emerald-600 text-white`}
          onClick={async () => {
            const res = await axios.put(`/friends/response/${statusFriends?.id}`, { status: "pending" });
            if (res.data.status) setStatusFriends({ id: res.data.id, status: res.data.status });
          }}
        >
          <FiUserPlus className="w-4 h-4" />
          Add Friend
        </button>
      ),
      "waiting-for-current-user-response": (
        <button
          className={`${btnBase} bg-emerald-500 hover:bg-emerald-600 text-white`}
          onClick={async () => {
            const res = await axios.put(`/friends/response/${statusFriends?.id}`, { status: "accepted" });
            if (res.data.status) setStatusFriends({ id: res.data.id, status: res.data.status });
          }}
        >
          <FiUserCheck className="w-4 h-4" />
          Accept Request
        </button>
      ),
    };

    return statusMap[statusFriends?.status || ""] || null;
  };

  return (
    <div className="space-y-4">
      {/* Profile header card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Cover image */}
        <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-teal-500">
          {userData?.coverImage && (
            <Image
              src={userData.coverImage}
              fill
              className="object-cover"
              alt={userData.fullName}
            />
          )}
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative w-20 h-20 ring-4 ring-white dark:ring-gray-900 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={userData?.avatar || "/images/user-avatar.png"}
                fill
                className="object-cover"
                alt={userData.fullName}
              />
            </div>
            <div className="mb-2">
              {userData?.id === user.id ? (
                <button
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => setOpenProfileModal(true)}
                >
                  <FiEdit3 className="w-4 h-4" />
                  Edit profile
                </button>
              ) : (
                renderFriendsButton()
              )}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{userData?.fullName}</h1>
            <a
              href={`mailto:${userData?.email}`}
              className="text-sm text-gray-400 hover:text-emerald-500 transition-colors"
            >
              {userData?.email}
            </a>
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* About sidebar */}
        <div className="col-span-12 md:col-span-4 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4">About</h2>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {profileData?.education && (
                <div className="flex items-center gap-3">
                  <FiGraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Went to {profileData.education}</span>
                </div>
              )}
              {profileData?.city && (
                <div className="flex items-center gap-3">
                  <FiHome className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>Lives in {profileData.city}</span>
                </div>
              )}
              {profileData?.from && (
                <div className="flex items-center gap-3">
                  <FiMapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>From {profileData.from}</span>
                </div>
              )}
              {profileData?.relationship && (
                <div className="flex items-center gap-3">
                  <FiHeart className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{profileData.relationship}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <FiClock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>Joined {moment(user.createAt).fromNow()}</span>
              </div>
            </div>
            {userData?.id === user.id && (
              <button
                className="w-full mt-4 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                onClick={() => setOpenDetailsModal(true)}
              >
                Edit Details
              </button>
            )}
          </div>
        </div>

        {/* Posts feed */}
        <div className="col-span-12 md:col-span-8 space-y-4">
          {userData?.id === user.id && <CreatePost setNewPost={setNewPost} />}
          {data?.pages.map((pageData) => (
            <Fragment key={pageData?.page}>
              {pageData?.posts &&
                [...pageData.posts].reverse().map((post) => (
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
              disabled={!hasNextPage || isFetchingNextPage}
              className="w-full h-9 rounded-xl text-sm text-gray-500 dark:text-gray-400 disabled:opacity-40"
            >
              {isFetchingNextPage ? "Loading more..." : hasNextPage ? "Load More" : ""}
            </button>
          </div>
          {isFetching && !isFetchingNextPage && (
            <p className="text-center text-sm text-gray-400">Loading...</p>
          )}
        </div>
      </div>

      <ProfileModal
        data={user}
        open={openProfileModal}
        setOpenProfileModal={setOpenProfileModal}
        setUpdateUserData={setUpdateUserData}
      />
      <AboutModal
        data={profileData}
        openDetailsModal={openDetailsModal}
        setOpenDetailsModal={setOpenDetailsModal}
        setUpdateUserData={setUpdateUserData}
      />
    </div>
  );
};

export default UserProfile;
