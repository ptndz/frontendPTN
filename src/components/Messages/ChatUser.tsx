import { useEffect, useState } from "react";
import { RiUserSmileLine } from "react-icons/ri";
import Image from "next/image";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { queryGetUserByUsername } from "../../graphql/user";
import { User } from "../../gql/graphql";

interface IProps {
  conversation: any;
  currentUser: User;
  currentChat: any;
  onlineUsers: any;
}

const ChatUser: React.FC<IProps> = ({
  conversation,
  currentUser,
  currentChat,
  onlineUsers,
}) => {
  const [userData, setUserData] = useState<User>();
  const friend: User = conversation.users.find(
    (u: User) => u.id !== currentUser.id
  );
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await graphQLClient.request(queryGetUserByUsername, {
          username: friend.username,
        });
        if (graphQLClientErrorCheck(res)) {
          if (res.getUser.user) setUserData(res.getUser.user);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, conversation, friend]);

  useEffect(() => {
    if (onlineUsers.size > 0) {
      setIsOnline(!!Array.from(onlineUsers).find((u) => u === userData?.id));
    }
  }, [onlineUsers, userData?.id]);

  const isActive = currentChat?.id === conversation.id;

  return (
    <div
      className={`px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
        isActive
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <div className="flex-shrink-0 relative w-10 h-10">
        {userData?.avatar ? (
          <Image
            fill
            className="object-cover rounded-full"
            src={userData.avatar}
            alt={userData?.fullName || ""}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <RiUserSmileLine className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <div
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${
            isOnline ? "bg-emerald-500" : "bg-gray-400"
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-gray-900 dark:text-gray-100"}`}>
          {userData?.fullName}
        </p>
      </div>
    </div>
  );
};

export default ChatUser;
