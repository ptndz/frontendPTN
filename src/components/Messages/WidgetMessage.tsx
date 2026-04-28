import { useEffect, useState } from "react";
import React from "react";
import socket from "../../plugins/socket";
import { IUser } from "../../gql/graphql";
import AvatarWidget from "./AvatarWidget";
import ChatWindow from "./ChatWindow";
import { useStoreChatWindow } from "../../store/widgetChat";
export interface IStateOpen {
  isOpen: boolean;
  id: number;
  user: IUser;
}
const WidgetMessage = () => {
  // const [chatWindows, setChatWindows] = useState<IStateOpen[]>([]);
  const { chatWindows, setChatWindows, setUpdatedWindows } =
    useStoreChatWindow();
  useEffect(() => {
    const handler = (chatWindow: any) => {
      setChatWindows(chatWindow);
    };
    socket.on("newChatWindow", handler);
    return () => { socket.off("newChatWindow", handler); };
  }, [setChatWindows]);

  const handleAvatarClick = (conversationId: number) => {
    if (chatWindows) {
      const updatedWindows = chatWindows.map((chat) => {
        if (chat.id === conversationId) {
          return {
            ...chat,
            isOpen: true,
          };
        }
        return chat;
      });
      setUpdatedWindows(updatedWindows);
    }
  };

  const handleCloseChat = (conversationId: number) => {
    if (chatWindows) {
      const updatedWindows = chatWindows.map((chat) => {
        if (chat.id === conversationId) {
          return {
            ...chat,
            isOpen: false,
          };
        }
        return chat;
      });
      setUpdatedWindows(updatedWindows);
    }
  };

  if (chatWindows) {
    return (
      <>
        <div className="fixed bottom-4 right-4 z-40">
          <div className="flex flex-col gap-3">
            {chatWindows.map((chat) => (
              <AvatarWidget
                key={chat.id}
                userData={chat.user}
                onClick={() => handleAvatarClick(chat.id)}
              />
            ))}
          </div>
        </div>
        <div className="fixed bottom-4 right-20 z-40">
          <div className="flex items-end gap-3">
            {chatWindows.map((chat) => (
              <ChatWindow
                key={chat.id}
                chat={chat}
                onClick={() => handleCloseChat(chat.id)}
              />
            ))}
          </div>
        </div>
      </>
    );
  }
  return null;
};

export default WidgetMessage;
