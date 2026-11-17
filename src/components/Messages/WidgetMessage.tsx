import { useEffect } from "react";
import React from "react";
import socket from "../../plugins/socket";
import { IUser } from "../../gql/graphql";
import AvatarWidget from "./AvatarWidget";
import ChatWindow from "./ChatWindow";
import { useStoreChatWindow } from "../../store/widgetChat";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
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
        <Stack gap={4} className="fixed bottom-0 right-0 mb-14 mr-4 p-4 max-lg:mb-[calc(5rem+env(safe-area-inset-bottom))]">
          {chatWindows.map((chat) => (
            <AvatarWidget
              key={chat.id}
              userData={chat.user}
              onClick={() => handleAvatarClick(chat.id)}
            />
          ))}
        </Stack>
        <HStack gap={4} className="fixed bottom-0 right-0 mb-14 mr-32 max-lg:mb-[calc(5rem+env(safe-area-inset-bottom))]">
          {chatWindows.map((chat) => (
            <ChatWindow
              key={chat.id}
              chat={chat}
              onClick={() => handleCloseChat(chat.id)}
            />
          ))}
        </HStack>
      </>
    );
  }
  return null;
};

export default WidgetMessage;
