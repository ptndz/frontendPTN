import { RiUserSmileLine } from "react-icons/ri";
import Image from "next/image";
import axios from "axios";
import { User } from "../../gql/graphql";
import { useEffect, useState } from "react";
import { queryGetUserByUuid } from "../../graphql/user";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";

interface IProps {
  onlineUser: string;
  setCurrentChat: (chat: any) => void;
}

const OnlineUsers: React.FC<IProps> = ({ onlineUser, setCurrentChat }) => {
  const [userData, setUserData] = useState<User>();

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await graphQLClient.request(queryGetUserByUuid, {
          userUuid: onlineUser,
        });
        if (graphQLClientErrorCheck(res)) {
          if (res.getUserByUuid.user) setUserData(res.getUserByUuid.user);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [onlineUser]);

  const handleClick = async (user: User) => {
    try {
      const res = await axios.get(`/messenger/conversation?friendId=${user.id}`);
      setCurrentChat(res.data.conversation);
    } catch (err) {
      console.log(err);
    }
  };

  if (!userData || !onlineUser) return null;

  return (
    <button
      onClick={() => handleClick(userData)}
      className="relative flex-shrink-0 group"
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-500 transition-all">
        {userData?.avatar ? (
          <Image
            fill
            className="object-cover"
            src={userData.avatar}
            alt={userData?.fullName || ""}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <RiUserSmileLine className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
    </button>
  );
};

export default OnlineUsers;
