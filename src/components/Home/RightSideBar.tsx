import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import UserListSkeleton from "../Loaders/UserListSkeleton";

import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { toast } from "react-toastify";
import { useStoreUser } from "../../store/user";
import { queryGetUsersYouMayKnow } from "../../graphql/user";
import { User } from "../../gql/graphql";

const RightSideBar = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useStoreUser();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await graphQLClient.request(queryGetUsersYouMayKnow);
        if (res.getUsersYouMayKnow.code === 400) {
          toast.error(res.getUsersYouMayKnow.message);
        }
        if (graphQLClientErrorCheck(res)) {
          if (res.getUsersYouMayKnow.users) {
            const data = res.getUsersYouMayKnow.users.filter((userData) => {
              return userData.id !== user.id;
            });
            setUsers(data);
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.warn(error);
      }
    };
    fetchData();
  }, [user.id]);
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
                    src={user.avatar || "/images/user-avatar.png"}
                    width="40"
                    height="40"
                    alt={user.fullName}
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
