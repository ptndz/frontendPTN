import { useEffect, useRef, useState, useDeferredValue } from "react";
import { useStoreUser } from "../../store/user";
import socket from "../../plugins/socket";
import ChatWidget from "./ChatWidget";
import { IStateOpen } from "./WidgetMessage";
import { RiSendPlaneLine } from "react-icons/ri";
import { BsX } from "react-icons/bs";
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
    const handler = (messagesI: any) => {
      setMessages(messagesI);
      setScroll(`smooth`);
    };
    socket.on("chatWindowMessages", handler);
    return () => { socket.off("chatWindowMessages", handler); };
  }, [chat]);

  useEffect(() => {
    const handler = (message: any) => {
      if (message.conversation.id === chat.id) {
        const allMessageIds = messages.map((m: any) => m.id);
        if (!allMessageIds.includes(message.id)) {
          setMessages(updateObjectInState(messages, message));
          setScroll(`smooth${message.id}`);
        }
      }
    };
    socket.on("newMessage", handler);
    return () => { socket.off("newMessage", handler); };
  }, [messages, deferredNewMessage, chat.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scroll]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (deferredNewMessage !== "" && chat.id !== undefined) {
      socket.emit("sendMessage", {
        message: deferredNewMessage,
        conversation: { id: chat?.id },
        user: { id: user.id },
        type: MessageType.TEXT,
      });
      setNewMessage("");
      setScroll(deferredNewMessage);
    }
  };

  if (!chat.isOpen) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-80 h-[460px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <Image
              fill
              className="object-cover"
              src={chat.user?.avatar || "/images/user-avatar.png"}
              alt={chat.user?.fullName || ""}
            />
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {chat.user?.fullName}
          </p>
        </div>
        <button
          onClick={onClick}
          className="w-7 h-7 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-500 transition-colors"
        >
          <BsX className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-3 bg-gray-50 dark:bg-gray-950">
        {messages.map((message: any) => (
          <div ref={scrollRef} key={message.id}>
            <ChatWidget message={message} own={message?.user.id !== user?.id} />
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            onChange={(e) => setNewMessage(e.target.value)}
            value={newMessage}
            placeholder="Write a message..."
            autoComplete="off"
            className="flex-1 h-9 px-3 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
          />
          <button
            type="submit"
            disabled={!newMessage}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <RiSendPlaneLine className="w-4 h-4 text-white rotate-45" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;

function updateObjectInState(state: any, objectToUpdate: any) {
  if (state.length === 0) return [objectToUpdate];
  const found = state.find((obj: any) => obj.id === objectToUpdate.id);
  if (!found) return [...state, objectToUpdate];
  return state.map((obj: any) =>
    obj.id === objectToUpdate.id ? objectToUpdate : obj
  );
}
