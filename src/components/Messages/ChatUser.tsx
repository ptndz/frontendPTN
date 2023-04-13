import { useEffect, useState } from "react";
import { RiUserSmileLine } from "react-icons/ri";
import Image from "next/image";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { queryGetUserByUsername } from "../../graphql/user";
import { User } from "../../gql/graphql";

interface IProps {
  conversation: any;
  currentUser: User;
  currentChat: any;
  onlineUsers?: User[];
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
  const friendOnline: User = conversation.users.find(
    (u: User) => u.id === currentUser.id
  );
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await graphQLClient.request(queryGetUserByUsername, {
          username: friend.username,
        });
        if (res.getUser.user) setUserData(res.getUser.user);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, conversation, friend]);
  return (
    <>
      <div
        className={`relative lg:px-4 px-2 py-2 rounded-lg flex items-center space-x-3 focus-within:ring-1 focus-within:ring-inset focus-within:ring-white hover:bg-gray-200 dark:hover:bg-zinc-800 ${
          currentChat?.id === conversation.id
            ? "bg-gray-200 dark:bg-zinc-800"
            : ""
        }`}>
        <div className="flex-shrink-0 relative md:w-14 md:h-14 w-9 h-9">
          {userData?.avatar ? (
            <Image
              layout="fill"
              objectFit="cover"
              className="h-full w-full rounded-full object-cover mr-2"
              src={userData?.avatar}
              alt={userData?.fullName}
            />
          ) : (
            <div className="md:w-14 md:h-14 w-9 h-9 rounded-full object-cover mr-2 bg-gray-300 dark:bg-zinc-900">
              <RiUserSmileLine className="w-full h-full object-cover p-2" />
            </div>
          )}

          {onlineUsers?.map((u) =>
            u.id === friendOnline?.id ? (
              <div
                key={u.id}
                className="absolute w-3 h-3 rounded-full bg-zinc-600 ring-2 ring-white dark:ring-black bottom-0 right-0"></div>
            ) : (
              <div
                key={u.id}
                className="absolute w-3 h-3 rounded-full bg-green-600 ring-2 ring-white dark:ring-black bottom-0 right-0"></div>
            )
          )}
        </div>
        <div className="flex-1 min-w-0 lg:block">
          <a href="#" className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true"></span>
            <p className="truncate text-base font-medium">
              {userData?.fullName}
            </p>
          </a>
        </div>
      </div>
      {/* <div className="absolute -bottom-[1px] lg:-bottom-[1px] dark:bg-white bg-black w-1/2 lg:w-3/4 h-1 left-1/2 -translate-x-1/2 rounded"></div> */}
    </>
  );
};

export default ChatUser;
