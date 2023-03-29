import Link from "next/link";
import { FaUsers, FaUserAlt } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import {
  BsChatLeftFill,
  BsGear,
  BsChat,
  BsChevronDown,
  BsFillBookmarksFill,
  BsFillBookmarkFill,
} from "react-icons/bs";
import { CgScreen } from "react-icons/cg";
import React, { useEffect, useState } from "react";

import Image from "next/image";
import { useStoreUser } from "../../store/user";

const LeftSideBar = () => {
  const { user } = useStoreUser();

  return (
    <div>
      <div className="w-full space-y-4">
        <div className="bg-white font-medium dark:bg-black p-5 rounded-lg drop-shadow-sm space-y-3">
          <p>Quick links</p>
          <div className="left-sidebar space-y-2">
            <Link
              href="/"
              className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-900 p-1.5 rounded-md">
              <CgScreen className="bg-blue-400 p-2 w-10 h-10 text-white rounded-md" />
              Newsfeed
            </Link>
            <Link
              href="/friends"
              className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-900 p-1.5 rounded-md">
              <FaUsers className="bg-red-400 p-2 w-10 h-10 text-white rounded-md" />
              Friends
            </Link>
            <Link
              href="/messenger"
              className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-900 p-1.5 rounded-md">
              <BsChatLeftFill className="bg-green-400 p-2 w-10 h-10 text-white rounded-md" />
              Messages
            </Link>
            <Link
              href="/posts/bookmarked"
              className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-900 p-1.5 rounded-md">
              <BsFillBookmarkFill className="bg-teal-400 p-2 w-10 h-10 text-white rounded-md" />
              Bookmarks
            </Link>
            <Link
              href={`/${user?.username}`}
              className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-900 p-1.5 rounded-md">
              <FaUserAlt className="bg-amber-400 p-2 w-10 h-10 text-white rounded-md" />
              My profile
            </Link>
          </div>
        </div>
        {/* <div className="my-5 bg-white dark:bg-black p-5 rounded-lg drop-shadow-sm">
          <p>More pages</p>
          <ul className="left-second-sidebar">
            <li>
              <Link href="https://gmail.com">
                <a target="_blank">
                  <i className="fa-solid fa-inbox p-3 text-indigo-500 text-2xl"></i>{" "}
                  Email Box
                </a>
              </Link>
            </li>
            <li>
              <a href="">
                <i className="fa-solid fa-home p-3 text-indigo-500 text-2xl"></i>{" "}
                Near Hotel
              </a>
            </li>
            <li>
              <a href="">
                <i className="fa-solid fa-location-dot p-3 text-indigo-500 text-2xl"></i>{" "}
                Latest Event
              </a>
            </li>
            <li>
              <a href="">
                <i className="fa-brands fa-youtube p-3 text-indigo-500 text-2xl"></i>{" "}
                Live Stream
              </a>
            </li>
          </ul>
        </div> */}
        <div className="bg-white font-medium dark:bg-black p-5 rounded-lg drop-shadow-sm space-y-3">
          <div className="left-sidebar space-y-2">
            <Link href={`/${user?.username}`} passHref>
              <div className="flex items-center gap-2 p-1.5 cursor-pointer">
                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                  {user?.avatar && (
                    <Image
                      alt={user && user.fullName}
                      src={user && user.avatar}
                      layout="fill"
                      objectFit="cover"
                    />
                  )}
                </div>
                <p>{user?.fullName}</p>
                <BsChevronDown className="ml-auto" />
              </div>
            </Link>
            <Link
              href={`/${user?.username}`}
              className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-900 p-1.5 rounded-md">
              <BsGear className="bg-indigo-400 p-2 w-10 h-10 text-white rounded-md" />
              Settings
            </Link>
            <Link
              href="/friends"
              className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-900 p-1.5 rounded-md">
              <BsChat className="bg-lime-400 p-2 w-10 h-10 text-white rounded-md" />
              Chat
            </Link>
            <Link
              href="/posts/bookmarked"
              className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-900 p-1.5 rounded-md">
              <BsFillBookmarksFill className="bg-sky-400 p-2 w-10 h-10 text-white rounded-md" />
              Saved posts
            </Link>
            <button className="flex items-center w-full gap-2 hover:bg-gray-200 dark:hover:bg-zinc-900 p-1.5 rounded-md">
              <FiLogOut className="bg-rose-400 p-2 w-10 h-10 text-white rounded-md" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeftSideBar;
