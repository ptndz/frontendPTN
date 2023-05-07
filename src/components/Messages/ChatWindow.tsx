import { useEffect, useRef, useState, useDeferredValue } from "react";
import { useStoreUser } from "../../store/user";
import socket from "../../plugins/socket";
import ChatWidget from "./ChatWidget";
import { IStateOpen } from "./WidgetMessage";
import { RiSendPlaneLine } from "react-icons/ri";
import Image from "next/image";
import { MessageType } from "./index";
interface IProps {
  chat: IStateOpen;
  onClick: () => void;
}

const ChatWindow: React.FC<IProps> = ({ chat, onClick }) => {
  const { user } = useStoreUser();
  const scrollRef: any = useRef();
  const [messages, setMessages] = useState<any[]>([]);
  const [scroll, setScroll] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const deferredNewMessage = useDeferredValue(newMessage);
  useEffect(() => {
    socket.emit("chatWindowJoinConversation", chat.id);
  }, [chat, user.id]);

  useEffect(() => {
    socket.on("chatWindowMessages", (messagesI: any) => {
      setMessages(messagesI);
      setScroll(`smooth`);
    });
  }, [chat, messages]);
  useEffect(() => {
    socket.on("newMessage", (message: any) => {
      if (message.conversation.id === chat.id) {
        const allMessageIds = messages.map((message: any) => message.id);
        if (!allMessageIds.includes(message.id)) {
          setMessages(updateObjectInState(messages, message));
          setScroll(`smooth${message.id}`);
        }
      }
    });
  }, [messages, deferredNewMessage, chat.id]);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scroll]);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (deferredNewMessage !== "" && chat.id !== undefined) {
      const message = {
        message: deferredNewMessage,
        conversation: {
          id: chat?.id,
        },
        user: {
          id: user.id,
        },
        type: MessageType.TEXT,
      };
      socket.emit("sendMessage", message);
      setNewMessage("");
      setScroll(deferredNewMessage);
    }
  };

  if (chat.isOpen) {
    return (
      <div className="flex items-center space-x-2 relative">
        <div
          className={`bg-white rounded-lg shadow-md overflow-hidden h-[37rem] w-96`}>
          <div className="absolute flex items-center justify-between px-4 py-2 bg-gray-100 w-96">
            <div className="flex-shrink-0 w-8 relative h-8 flex mb-5">
              <Image
                layout="fill"
                objectFit="cover"
                className="h-full w-full rounded-full object-cover mr-2"
                src={chat.user?.avatar || "/images/user-avatar.png"}
                alt={chat.user?.fullName}
              />
            </div>

            <p className="text-xs font-medium dark:text-gray-300 text-gray-600">
              {chat.user?.fullName}
            </p>
            <button className="focus:outline-none" onClick={onClick}>
              Close
            </button>
          </div>
          <div className="h-72 flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
            <div className="flex flex-col flex-grow w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
              <div className="max-h-full flex flex-col flex-grow h-0 p-4 overflow-auto space-y-9">
                {messages.map((message: any) => (
                  <div ref={scrollRef} key={message.id}>
                    <div>
                      <ChatWidget
                        message={message}
                        own={message?.user.id !== user?.id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-300 p-4 sticky bottom-0">
              <form>
                <div className="flex gap-3">
                  <input
                    type="text"
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                    name="message"
                    placeholder="Aa"
                    autoComplete="off"
                    className="w-full bg-gray-50 dark:bg-transparent rounded-full bg-opacity-50 border border-gray-300 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-200 focus:bg-transparent focus:border-indigo-500 text-base outline-none py-1 px-8 leading-8 transition-colors duration-200 ease-in-out mr-14"
                  />
                  <button
                    onClick={handleSubmit}
                    disabled={!newMessage}
                    className="inline-flex disabled:cursor-not-allowed gap-2 items-center justify-center border border-transparent rounded-full shadow-sm">
                    <RiSendPlaneLine className="h-4 w-4 text-white rotate-45 rounded-full bg-indigo-500 hover:bg-indigo-600 focus:outline-none box-content p-3" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default ChatWindow;
function updateObjectInState(state: any, objectToUpdate: any) {
  if (state.length === 0) {
    return [objectToUpdate];
  }
  const foundObject = state.find((obj: any) => obj.id === objectToUpdate.id);
  if (!foundObject) {
    // Nếu không tìm thấy object có id tương ứng, thêm mới object vào mảng
    return [...state, objectToUpdate];
  } else {
    // Nếu tìm thấy object có id tương ứng, cập nhật object đó trong mảng
    const newState = state.map((obj: any) => {
      if (obj.id === objectToUpdate.id) {
        return objectToUpdate;
      } else {
        return obj;
      }
    });
    return newState;
  }
}
