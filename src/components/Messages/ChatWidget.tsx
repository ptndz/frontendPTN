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
    if (message.type === MessageType.IMAGE) {
      return (
        <Image
          width={200}
          height={200}
          src={message.message}
          alt={user.fullName || ""}
          className="rounded-xl"
        />
      );
    }
    return <p className="text-sm">{message.message}</p>;
  };

  const Avatar = () => (
    <div className="flex-shrink-0 relative w-7 h-7">
      {user?.avatar ? (
        <Image
          fill
          className="object-cover rounded-full"
          src={user.avatar}
          alt={user?.fullName || ""}
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <RiUserSmileLine className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );

  return (
    <div className={`flex items-end gap-2 ${own ? "" : "flex-row-reverse"}`}>
      <Avatar />
      <div className={`max-w-[70%] ${own ? "" : "items-end"} flex flex-col`}>
        <div
          className={`px-3 py-2 ${
            own
              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm"
              : "bg-emerald-500 text-white rounded-2xl rounded-br-sm"
          }`}
        >
          {renderContent()}
        </div>
        <span className="text-[10px] text-gray-400 mt-1 px-1">
          {moment(message.createdAt).fromNow()}
        </span>
      </div>
    </div>
  );
};

export default ChatWidget;
