import React, { useDeferredValue, useEffect, useRef, useState } from "react";
import Navigation from "../Share/Navigation";
import ChatUserSearchOffCanvas from "./ChatUserSearchOffcanvas";
import { FiSearch } from "react-icons/fi";
import { RiSendPlaneLine } from "react-icons/ri";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { FcAddImage } from "react-icons/fc";
import { BsX } from "react-icons/bs";
import axios from "axios";

import ChatUser from "./ChatUser";
import Chat from "./Chat";
import UserListSkeleton from "../Loaders/UserListSkeleton";
import OnlineUsers from "./OnlineUsers";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";

import socket from "../../plugins/socket";
import Image from "next/image";

export enum MessageType {
  TEXT = "TEXT",
  URL = "URL",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  FILE = "FILE",
  LOCATION = "LOCATION",
  CONTACT = "CONTACT",
  STICKER = "STICKER",
}

const MessagingMain = () => {
  const [isSearchOffCanvasOpen, setIsSearchOffCanvasOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const closeSearchOffCanvas = () => setIsSearchOffCanvasOpen(false);
  const openSearchOffCanvas = () => setIsSearchOffCanvasOpen(true);

  const { user } = useStoreUser();
  const [conversations, setConversations] = useState<any>([]);
  const [currentChat, setCurrentChat] = useState<any>();
  const [messages, setMessages] = useState<any>([]);
  const [newMessage, setNewMessage] = useState("");

  const [scroll, setScroll] = useState<string>("");
  const [allUsers, setAllUsers] = useState<User[]>();

  const [onlineUsers, setOnlineUsers] = useState(new Set<string>());
  const scrollRef: any = useRef();
  const deferredNewMessage = useDeferredValue(newMessage);
  const [image, setImage] = useState<File[]>();
  const [imagePreview, setImagePreview] = useState<string[]>();

  useEffect(() => {
    socket.on("onlineFriends", (friendList: any) => {
      setOnlineUsers(new Set<string>(friendList));
    });
    socket.on("connected", (userid: string) => {
      if (onlineUsers instanceof Set && !onlineUsers.has(userid)) {
        const next = new Set<string>(onlineUsers);
        next.add(userid);
        setOnlineUsers(next);
      }
    });
    socket.on("disconnected", (userid: string) => {
      if (onlineUsers instanceof Set && onlineUsers.has(userid)) {
        const next = new Set<string>(onlineUsers);
        next.delete(userid);
        setOnlineUsers(next);
      }
    });
  }, [onlineUsers]);

  useEffect(() => {
    socket.on("conversations", (conversations: any) => {
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
      socket.emit("joinConversation", friend.id);
    }
  }, [currentChat, user.id]);

  useEffect(() => {
    socket.on("messages", (messages: any) => {
      setMessages(messages);
      setScroll("scroll");
    });
  }, [currentChat]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (deferredNewMessage !== "" && currentChat.id !== undefined) {
      socket.emit("sendMessage", {
        message: deferredNewMessage,
        conversation: { id: currentChat?.id },
        user: { id: user.id },
        type: MessageType.TEXT,
      });
      setNewMessage("");
    }
  };

  const handleSubmitImage = async (e: any) => {
    e.preventDefault();
    setIsLoading(false);
    const formData = new FormData();
    let imagesData: string[] = [];
    if (image) {
      image.map((img: File) => formData.append("images", img));
      const resImages = await axios.post("/image", formData);
      if (resImages.data.code === 200 && resImages.data.images) {
        imagesData = resImages.data.images;
      }
    }
    if (currentChat.id && imagesData.length > 0) {
      await imagesData.map(async (value) => {
        await socket.emit("sendMessage", {
          message: value,
          conversation: { id: currentChat?.id },
          user: { id: user.id },
          type: MessageType.IMAGE,
        });
      });
    }
    setImage(undefined);
    setImagePreview(undefined);
    setIsLoading(true);
  };

  const handleImageChange = (event: any) => {
    const files = event.target.files;
    const images: any = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        images.push(URL.createObjectURL(files[i]));
      }
      setImagePreview((prev) => (prev ? [...prev, ...images] : [...images]));
      setImage((prev) => (prev ? [...prev, files[0]] : [files[0]]));
    }
  };

  useEffect(() => {
    socket.on("newMessage", (message: any) => {
      const allIds = messages.map((m: any) => m.id);
      if (!allIds.includes(message.id)) {
        setMessages([...messages, message]);
        setScroll(`scroll-${message.id}`);
      }
    });
  }, [messages, deferredNewMessage]);

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await axios.get("/friends/my");
      if (res.data.success) setAllUsers(res.data.friends);
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, scroll]);

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-950 overflow-hidden">
      {allUsers && (
        <ChatUserSearchOffCanvas
          setCurrentChat={setCurrentChat}
          currentId={user.id}
          allUsers={allUsers}
          closeOffCanvas={closeSearchOffCanvas}
          isOffCanvasOpen={isSearchOffCanvasOpen}
        />
      )}

      <Navigation />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — conversation list */}
        <aside className="flex flex-col w-72 lg:w-80 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="p-3 border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={openSearchOffCanvas}
              className="w-full h-9 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiSearch className="w-4 h-4" />
              <span>Search conversations...</span>
            </button>
          </div>

          {/* Online users strip */}
          {onlineUsers.size > 0 && (
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto scrollbar-hide flex gap-2">
              {Array.from(onlineUsers).map((u: any) => (
                <div key={u} className="flex-shrink-0">
                  <OnlineUsers
                    key={u}
                    onlineUser={u}
                    setCurrentChat={setCurrentChat}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto scrollbar-hide p-2 space-y-1">
            {conversations.length === 0 ? (
              <UserListSkeleton />
            ) : (
              [...conversations]
                .reverse()
                .map((c: any) => (
                  <div
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => setCurrentChat(c)}
                  >
                    <ChatUser
                      conversation={c}
                      currentUser={user}
                      currentChat={currentChat}
                      onlineUsers={onlineUsers}
                    />
                  </div>
                ))
            )}
          </div>
        </aside>

        {/* Chat area */}
        <main className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-950 overflow-hidden">
          {currentChat ? (
            <>
              <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-6 space-y-4">
                {messages.map((m: any) => (
                  <div ref={scrollRef} key={m.id}>
                    <Chat message={m} own={m?.user.id === user?.id} />
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3">
                <form>
                  <div className="flex items-center gap-3">
                    <label htmlFor="image-upload" className="cursor-pointer flex-shrink-0">
                      <FcAddImage className="w-8 h-8" />
                    </label>
                    <input
                      type="file"
                      id="image-upload"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="flex-1 flex items-center gap-3 relative">
                        <div className="flex gap-2 flex-wrap">
                          {imagePreview.map((img, i) => (
                            <div key={i} className="relative">
                              <Image src={img} alt="" width={80} height={80} className="rounded-lg object-cover" />
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => { setImage(undefined); setImagePreview(undefined); }}
                          className="flex-shrink-0"
                        >
                          <BsX className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                        </button>
                        {isLoading && (
                          <button
                            onClick={handleSubmitImage}
                            disabled={!imagePreview}
                            type="button"
                            className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center transition-colors"
                          >
                            <RiSendPlaneLine className="w-4 h-4 text-white rotate-45" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          onChange={(e) => setNewMessage(e.target.value)}
                          value={newMessage}
                          name="message"
                          placeholder="Write a message..."
                          autoComplete="off"
                          className="flex-1 h-9 px-4 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                        />
                        <button
                          onClick={handleSubmit}
                          disabled={!newMessage}
                          type="button"
                          className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <RiSendPlaneLine className="w-4 h-4 text-white rotate-45" />
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                  <HiOutlineChatAlt2 className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MessagingMain;
