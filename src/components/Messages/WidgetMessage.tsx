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
    socket.on("newChatWindow", (chatWindow: any) => {
      // setChatWindows(updateObjectInState(chatWindows, chatWindow));
      setChatWindows(chatWindow);
    });
  }, [chatWindows, setChatWindows]);

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
        <div className="fixed bottom-0 right-0 mb-14 mr-4">
          <div className="flex flex-col space-y-4 p-4">
            {chatWindows.map((chat) => (
              <AvatarWidget
                key={chat.id}
                userData={chat.user}
                onClick={() => handleAvatarClick(chat.id)}
              />
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 right-0 mb-14 mr-32">
          <div className="flex items-center space-x-4">
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
