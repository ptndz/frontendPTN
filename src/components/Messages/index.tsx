import React, { useEffect, useRef, useState } from "react";
import Navigation from "../Share/Navigation";
import ChatUserSearchOffcanvas from "./ChatUserSearchOffcanvas";
import { FiSearch } from "react-icons/fi";
import { RiSendPlaneLine } from "react-icons/ri";
import { HiOutlineChatAlt2 } from "react-icons/hi";

import axios from "axios";
import { io } from "socket.io-client";
import ChatUser from "./ChatUser";
import Chat from "./Chat";
import UserListSkeleton from "../Loaders/UserListSkeleton";
import OnlineUsers from "./OnlineUsers";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";
import { getCookie } from "cookies-next";

const MessagingMain = () => {
  const [isSearchOffcanvasOpen, setIsSearchOffcanvasOpen] = useState(false);
  const closeSearchOffcanvas = () => setIsSearchOffcanvasOpen(false);
  const openSearchOffcanvas = () => setIsSearchOffcanvasOpen(true);

  const { user } = useStoreUser();
  const [conversations, setConversations] = useState<any>([]);
  const [currentChat, setCurrentChat] = useState<any>();
  const [messages, setMessages] = useState<any>([]);
  const [newMessage, setNewMessage] = useState("");

  const [scroll, setScroll] = useState<string>("");
  const [allUsers, setAllUsers] = useState<User[]>();
  const [onlineUsers, setOnlineUsers] = useState<User[]>();
  const scrollRef: any = useRef();
  const socket: any = useRef();
  const token = getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string);
  useEffect(() => {
    socket.current = io(process.env.NEXT_PUBLIC_BASE_URL_API as string, {
      auth: {
        token: token,
      },
    });
  }, [token]);

  useEffect(() => {
    socket.current.on("conversations", (conversations: any) => {
      setConversations(conversations);
    });
  }, [user.id, currentChat]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("/messenger/getConversations");

        setConversations(res.data.conversations);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user.id, currentChat]);

  useEffect(() => {
    const friend: User = currentChat?.users.find((u: User) => u.id !== user.id);
    if (friend) {
      socket.current.emit("joinConversation", friend.id);
    }
  }, [currentChat, user.id]);
  useEffect(() => {
    socket.current.on("messages", (messages: any) => {
      setMessages(messages);
      setScroll("scroll");
    });
  }, [currentChat]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (newMessage !== "" && currentChat.id !== undefined) {
      const message = {
        message: newMessage,
        conversation: {
          id: currentChat?.id,
        },
        user: {
          id: user.id,
        },
      };
      socket.current.emit("sendMessage", message);
      setNewMessage("");
    }
  };
  useEffect(() => {
    socket.current.on("newMessage", (message: any) => {
      const allMessageIds = messages.map((message: any) => message.id);
      if (!allMessageIds.includes(message.id)) {
        setMessages([...messages, message]);

        setScroll(`scroll-${message.id}`);
      }
    });
  }, [messages, newMessage]);

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await axios.get("/friends/my");
      if (res.data.success) {
        setAllUsers(res.data.friends);
        setOnlineUsers(res.data.friends);
      }
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, scroll]);

  return (
    <div className="relative h-screen flex overflow-hidden bg-white dark:bg-black mx-auto shadow-md">
      {/* <!-- Static sidebar for desktop --> */}
      {allUsers && (
        <ChatUserSearchOffcanvas
          setCurrentChat={setCurrentChat}
          currentId={user.id}
          allUsers={allUsers}
          onlineUsers={onlineUsers}
          closeOffcanvas={closeSearchOffcanvas}
          isOffcanvasOpen={isSearchOffcanvasOpen}
        />
      )}

      <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
        {/* topbar */}
        <Navigation />
        {/* end of topbar */}

        <div className="flex-1 relative z-0 flex overflow-hidden">
          {/* Chat user list */}
          <aside className="flex flex-col flex-shrink-0 lg:w-80 2xl:w-96 border-r border-t sm:border-t-0 border-gray-200 dark:border-zinc-600">
            {/* search */}
            <div className="flex gap-2 flex-col px-2 pt-2 lg:flex-row w-full">
              <div
                onClick={openSearchOffcanvas}
                className="cursor-pointer hover:bg-opacity-60 dark:hover:bg-opacity-60 relative overflow-hidden w-full px-2 py-4 rounded-lg flex items-center bg-gray-100 dark:bg-zinc-800 focus-within:ring-1 focus-within:ring-inset focus-within:ring-white">
                <div className="w-full flex items-center justify-center">
                  <FiSearch className="h-5 w-5" />
                </div>
                <div className="absolute -bottom-[1px] dark:bg-white bg-black w-1/2 left-1/2 -translate-x-1/2 h-1 rounded"></div>
              </div>
            </div>
            {/* online user list */}
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
              {onlineUsers && onlineUsers.length > 0 && (
                <div className="py-3 overflow-x-scroll	scrollbar flex">
                  {onlineUsers?.map((u) => (
                    <div className={`px-2 relative cursor-pointer`} key={u.id}>
                      <OnlineUsers
                        key={u.id}
                        onlineUser={u}
                        setCurrentChat={setCurrentChat}
                      />
                    </div>
                  ))}
                </div>
              )}
              <ul className="relative py-2 space-y-1">
                {conversations.length === 0 ? (
                  <UserListSkeleton />
                ) : (
                  conversations
                    ?.map((c: any) => (
                      <li
                        className={`px-2 relative overflow-hidden cursor-pointer`}
                        onClick={() => setCurrentChat(c)}
                        key={c.id}>
                        <ChatUser
                          key={c.id}
                          conversation={c}
                          currentUser={user}
                          currentChat={currentChat}
                          onlineUsers={onlineUsers}
                        />
                      </li>
                    ))
                    .reverse()
                )}
              </ul>
            </div>
          </aside>
          {/* Chat user list */}

          {/* Area */}

          <main className="flex flex-col justify-between bg-gray-100 dark:bg-black flex-1 overflow-y-auto hide-scrollbar border-t dark:border-zinc-600 sm:border-t-0">
            {currentChat ? (
              <>
                {/* chat body */}
                <div className="flex-1 w-full mx-auto py-8 px-3 space-y-6">
                  {messages.map((m: any) => (
                    <div ref={scrollRef} key={m.id}>
                      <Chat message={m} own={m?.user.id === user?.id} />
                    </div>
                  ))}
                </div>
                {/* chat footer */}
                <div className="sticky bottom-0">
                  <div className="border-t border-gray-200 dark:border-zinc-600 dark:bg-black bg-white py-4 lg:px-12 px-4">
                    <form>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          onChange={(e) => setNewMessage(e.target.value)}
                          value={newMessage}
                          name="message"
                          placeholder="Aa"
                          autoComplete="off"
                          className="w-full bg-gray-50 dark:bg-transparent rounded-full bg-opacity-50 border border-gray-300 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-200 focus:bg-transparent focus:border-indigo-500 text-base outline-none py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
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
              </>
            ) : (
              <div className="px-3 h-full flex items-center ">
                <div className="relative col-span-4 block max-w-2xl w-full mx-auto border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <HiOutlineChatAlt2 className="mx-auto h-12 w-12 dark:text-white text-black" />
                  <span className="mt-2 block text-lg font-medium text-gray-900 dark:text-gray-50">
                    Open a conversation to start a chat.
                  </span>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MessagingMain;
