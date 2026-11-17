import axios from "axios";
import { User } from "../../gql/graphql";
import { useEffect, useState } from "react";
import { queryGetUserByUuid } from "../../graphql/user";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { Avatar, AvatarStatusDot } from "@astryxdesign/core/Avatar";

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
      const res = await axios.get(
        `/messenger/conversation?friendId=${user.id}`
      );
      setCurrentChat(res.data.conversation);
    } catch (err) {
      console.log(err);
    }
  };
  if (userData && onlineUser) {
    return (
      <button
        type="button"
        onClick={() => handleClick(userData)}
        className="rounded-lg hover:bg-paper focus:outline-none">
        <Avatar
          src={userData?.avatar}
          fallbackSrc="/images/user-avatar.png"
          name={userData?.fullName}
          size={40}
          tooltip={false}
          status={<AvatarStatusDot variant="success" />}
        />
      </button>
    );
  }
  return null;
};

export default OnlineUsers;
