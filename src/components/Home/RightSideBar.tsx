import axios from "axios";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import UserListSkeleton from "../Loaders/UserListSkeleton";
import { graphQLClient, graphQLClientErrorCheck } from "../../plugins/graphql.plugin";
import { toast } from "react-toastify";
import { useStoreUser } from "../../store/user";
import { queryGetUsersYouMayKnow } from "../../graphql/user";
import { User } from "../../gql/graphql";
import { FiUserPlus } from "react-icons/fi";

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
            setUsers(res.getUsersYouMayKnow.users.filter((u) => u.id !== user.id));
          }
        }
      } catch (error) {
        console.warn(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  return (
    <div className="space-y-3 py-4">
      {/* People you may know */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">People you may know</h3>
          <p className="text-xs text-gray-400 mt-0.5">Suggested for you</p>
        </div>

        <div className="px-2 pb-2 space-y-0.5">
          {loading ? (
            <div className="px-2">
              <UserListSkeleton />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No suggestions right now</p>
          ) : (
            users.map((u) => (
              <Link
                href={`/${u.username}`}
                key={u.username}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
              >
                <div className="relative w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
                  <Image
                    src={u.avatar || "/images/user-avatar.png"}
                    fill
                    alt={u.fullName}
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                </div>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <FiUserPlus className="text-sm" />
                </span>
              </Link>
            ))
          )}
        </div>

        {users.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/friends"
              className="flex items-center justify-center gap-2 py-3 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              See all suggestions
            </Link>
          </div>
        )}
      </div>

      {/* Footer links */}
      <div className="px-1">
        <p className="text-xs text-gray-400 leading-relaxed">
          Privacy · Terms · Advertising · Cookies ·{" "}
          <span className="font-medium text-gray-500">PTN Social</span> © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default RightSideBar;
