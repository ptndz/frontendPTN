import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { RiUserSmileLine } from "react-icons/ri";
import moment from "moment";
import { User } from "../../gql/graphql";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { queryGetUser } from "../../graphql/user";
interface IProps {
  message: any;
  own: boolean;
}

const Chat: React.FC<IProps> = ({ message, own }) => {
  const [user, setUser] = useState<User>();
  console.log(message);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await graphQLClient.request(queryGetUser, {
          username: message.user.username,
        });
        if (res.getUser.user) setUser(res.getUser.user);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [message, message.id]);
  return (
    <>
      {own ? (
        <div className="flex items-end gap-2 flex-row-reverse">
          <div className="flex-shrink-0 w-8 relative h-8 flex mb-5">
            {user?.avatar ? (
              <Image
                layout="fill"
                objectFit="cover"
                className="h-full w-full rounded-full object-cover mr-2"
                src={user?.avatar}
                alt={user?.fullName}
              />
            ) : (
              <div className="w-10 h-10 rounded-full object-cover mr-2 bg-gray-300 dark:bg-zinc-900">
                <RiUserSmileLine className="w-full h-full object-cover p-2" />
              </div>
            )}
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs font-medium dark:text-gray-300 text-gray-600">
              {user?.fullName}
            </p>
            <p className="bg-blue-500 text-white text-left text-sm font-normal md:max-w-sm max-w-sm shadow py-2 px-4 inline-block rounded-md">
              {message.message}
            </p>
            <div className="text-xs">{moment(message.createdAt).fromNow()}</div>
          </div>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <div className="flex-shrink-0 w-8 relative h-8 flex mb-5">
            {user?.avatar ? (
              <Image
                layout="fill"
                objectFit="cover"
                className="h-full w-full rounded-full object-cover mr-2"
                src={user?.avatar}
                alt={user?.fullName}
              />
            ) : (
              <div className="w-10 h-10 rounded-full object-cover mr-2 bg-gray-300 dark:bg-zinc-900">
                <RiUserSmileLine className="w-full h-full object-cover p-2" />
              </div>
            )}
          </div>
          <div className="text-left space-y-1">
            <p className="text-xs font-medium dark:text-gray-300 text-gray-600">
              {user?.fullName}
            </p>
            <p className="bg-white dark:bg-zinc-800 text-sm font-normal md:max-w-sm max-w-sm shadow py-2 px-4 inline-block rounded-md">
              {message.message}
            </p>
            <div className="text-xs">{moment(message.createdAt).fromNow()}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
