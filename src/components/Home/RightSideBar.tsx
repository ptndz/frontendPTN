import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import UserListSkeleton from "../Loaders/UserListSkeleton";

import { graphql } from "../../gql";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { Theme, toast } from "react-toastify";
import { useStoreTheme } from "../../store/state";
interface IUser {
  fullName: string;
  avatar: string;
  username: string;
}
const RightSideBar = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useStoreTheme();
  const queryUsers = graphql(`
    query getUsers {
      getUsers {
        code
        success
        message
        users {
          fullName
          avatar
          username
        }
        errors {
          message
          field
        }
      }
    }
  `);
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const res = await graphQLClient.request(queryUsers);
      if (res.getUsers.code === 400) {
        toast.error(res.getUsers.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          theme: theme ? (theme as Theme) : "light",
        });
      }
      if (res.getUsers.users) {
        setUsers(res.getUsers.users);
      }
      setLoading(false);
    };
    fetchData();
  }, [queryUsers, theme]);
  return (
    <div>
      <div className="bg-white dark:bg-black drop-shadow-sm p-3 rounded-lg">
        <p className="mb-3">You may know</p>
        <ul className="space-y-2">
          {loading && <UserListSkeleton />}
          {users.map((user) => (
            <Link href={`${user.username}`} key={user.username} passHref>
              <li className="dark:hover:bg-zinc-900 hover:bg-gray-200 p-2 rounded-md">
                <span className="flex items-center cursor-pointer">
                  <Image
                    src={
                      user.avatar ||
                      "http://uitheme.net/sociala/images/profile-4.png"
                    }
                    width="40"
                    height="40"
                    alt="user"
                    className="rounded-full"
                  />
                  <span className="ml-3 contact-users" title={user.fullName}>
                    {user.fullName}
                  </span>
                  <FiChevronRight className="ml-auto" />
                </span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RightSideBar;
