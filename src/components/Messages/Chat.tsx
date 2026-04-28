import Image from "next/image";
import { RiUserSmileLine } from "react-icons/ri";
import moment from "moment";
import { MessageType } from "./index";

interface IProps {
  message: any;
  own: boolean;
}

const Chat: React.FC<IProps> = ({ message, own }) => {
  const user = message.user;

  const renderContent = () => {
    switch (message.type) {
      case MessageType.IMAGE:
        return (
          <Image
            width={500}
            height={500}
            src={message.message}
            alt={user.fullName}
            className="rounded-2xl max-w-xs"
          />
        );
      default:
        return own ? (
          <p className="bg-emerald-500 text-white text-sm py-2 px-4 inline-block rounded-2xl rounded-br-sm max-w-sm">
            {message.message}
          </p>
        ) : (
          <p className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm py-2 px-4 inline-block rounded-2xl rounded-bl-sm max-w-sm">
            {message.message}
          </p>
        );
    }
  };

  return (
    <div className={`flex items-end gap-2 ${own ? "flex-row-reverse" : ""}`}>
      <div className="flex-shrink-0 relative w-8 h-8">
        {user?.avatar ? (
          <Image
            fill
            className="object-cover rounded-full"
            src={user.avatar}
            alt={user?.fullName || ""}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <RiUserSmileLine className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>
      <div className={`space-y-1 ${own ? "text-right" : "text-left"}`}>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {user?.fullName}
        </p>
        {renderContent()}
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {moment(message.createdAt).fromNow()}
        </p>
      </div>
    </div>
  );
};

export default Chat;
