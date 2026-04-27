import Image from "next/image";
import moment from "moment";
import { RiUserSmileLine } from "react-icons/ri";
import { MessageType } from "./index";
interface IProps {
  message: any;
  own: boolean;
}
const ChatWidget: React.FC<IProps> = ({ message, own }) => {
  const user = message.user;

  const renderContent = () => {
    switch (message.type) {
      case MessageType.TEXT:
        return <p className="text-sm">{message.message}</p>;
      case MessageType.IMAGE:
        return (
          <Image
            width={200}
            height={200}
            src={message.message}
            alt={user.fullName}
          />
        );
      default:
        return <p className="text-sm">{message.message}</p>;
    }
  };

  return (
    <>
      {own ? (
        <div className="flex w-full mt-2 space-x-3 max-w-xs">
          <div className="flex-shrink-0 w-8 relative h-8 flex mb-5">
            {user?.avatar ? (
              <Image
                layout="fill"
                objectFit="cover"
                className="h-full w-full rounded-full object-cover mr-2"
                src={user?.avatar || "/images/user-avatar.png"}
                alt={user?.fullName}
              />
            ) : (
              <div className="w-10 h-10 rounded-full object-cover mr-2 bg-gray-300 dark:bg-zinc-900">
                <RiUserSmileLine className="w-full h-full object-cover p-2" />
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium dark:text-gray-300 text-gray-600">
              {user?.fullName}
            </p>
            <div className="bg-gray-300 p-3 rounded-r-lg rounded-bl-lg">
              {renderContent()}
            </div>
            <span className="text-xs text-gray-500 leading-none">
              {moment(message.createdAt).fromNow()}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end">
          <div>
            <p className="text-xs font-medium dark:text-gray-300 text-gray-600">
              {user?.fullName}
            </p>
            <div className="bg-blue-600 text-white p-3 rounded-l-lg rounded-br-lg">
              {renderContent()}
            </div>
            <span className="text-xs text-gray-500 leading-none">
              {moment(message.createdAt).fromNow()}
            </span>
          </div>
          <div className="flex-shrink-0 w-8 relative h-8 flex mb-5">
            {user?.avatar ? (
              <Image
                layout="fill"
                objectFit="cover"
                className="h-full w-full rounded-full object-cover mr-2"
                src={user?.avatar || "/images/user-avatar.png"}
                alt={user?.fullName}
              />
            ) : (
              <div className="w-10 h-10 rounded-full object-cover mr-2 bg-gray-300 dark:bg-zinc-900">
                <RiUserSmileLine className="w-full h-full object-cover p-2" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
