import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import { User } from "../../gql/graphql";

interface IProps {
  user: User;
}

const SingleFriends: React.FC<IProps> = ({ user }) => {
  const router = useRouter();
  const { fullName, username, avatar } = user;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
      <div className="relative h-32 bg-gradient-to-br from-emerald-400 to-teal-500">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="relative w-16 h-16 ring-4 ring-white dark:ring-gray-900 rounded-full overflow-hidden">
            <Image
              src={avatar || "/images/user-avatar.png"}
              fill
              className="object-cover"
              alt={fullName || ""}
            />
          </div>
        </div>
      </div>
      <div className="pt-10 pb-4 px-4 flex flex-col items-center text-center gap-3">
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{fullName}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">@{username}</p>
        </div>
        <button
          onClick={() => router.push(`/${username}`)}
          className="w-full h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
        >
          View profile
        </button>
      </div>
    </div>
  );
};

export default SingleFriends;
