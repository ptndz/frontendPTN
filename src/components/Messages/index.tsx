import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Navigation from "../Share/Navigation";
import ChatUserSearchOffCanvas from "./ChatUserSearchOffcanvas";
import { FiSearch } from "react-icons/fi";
import { FiPhone, FiVideo, FiPlus, FiChevronLeft, FiImage, FiUsers, FiFileText } from "react-icons/fi";
import { RiSendPlaneLine } from "react-icons/ri";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import axios from "axios";
import { toast } from "react-toastify";

import ChatUser from "./ChatUser";
import Chat from "./Chat";
import UserListSkeleton from "../Loaders/UserListSkeleton";
import OnlineUsers from "./OnlineUsers";
import GroupChatModal from "./GroupChatModal";
import WorkflowPanel from "./WorkflowPanel";
import { useI18n } from "../../i18n/I18nProvider";
import GroupMembersPanel from "./GroupMembersPanel";
import { conversationUsersToMentionItems, mentionItemKeywords } from "../../lib/mentions";
import { isBotUser } from "../../lib/botUsers";
import { buildTypingText, TYPING_REEMIT_MS, typingDisplayName } from "../../lib/typing";
import MediaGallery from "./MediaGallery";
import { STICKER_SET } from "./stickers";
import { useStoreUser } from "../../store/user";
import { useCallStore } from "../../store/call";
import { User } from "../../gql/graphql";

import socket from "../../plugins/socket";
import Image from "next/image";
import { ChatLayout, ChatMessageList, ChatComposer, ChatComposerInput, type ChatComposerTrigger } from "@astryxdesign/core/Chat";
import { createStaticSource } from "@astryxdesign/core/Typeahead";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Icon } from "@astryxdesign/core/Icon";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { List, ListItem } from "@astryxdesign/core/List";
import { Avatar, AvatarStatusDot } from "@astryxdesign/core/Avatar";
import { AvatarGroup } from "@astryxdesign/core/AvatarGroup";
import { Badge } from "@astryxdesign/core/Badge";

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
  const { t, locale } = useI18n();
  const [isSearchOffCanvasOpen, setIsSearchOffCanvasOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Trạng thái tải danh sách hội thoại — tách riêng khỏi `isLoading`
  // (cái kia phục vụ nút gửi ảnh). Trước đây list render skeleton mỗi
  // khi conversations rỗng, kể cả khi đã tải xong và thật sự không có
  // hội thoại nào, nên skeleton hiện mãi không dứt.
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [conversationsError, setConversationsError] = useState(false);
  const [conversationsRefresh, setConversationsRefresh] = useState(0);
  const closeSearchOffCanvas = () => setIsSearchOffCanvasOpen(false);
  const openSearchOffCanvas = () => setIsSearchOffCanvasOpen(true);

  const { user } = useStoreUser();
  const [conversations, setConversations] = useState<any>([]);
  const [currentChat, setCurrentChat] = useState<any>();
  const [messages, setMessages] = useState<any>([]);
  const [newMessage, setNewMessage] = useState("");

  const [allUsers, setAllUsers] = useState<User[]>();

  const [onlineUsers, setOnlineUsers] = useState(new Set<string>());
  const [image, setImage] = useState<File[]>();
  const [imagePreview, setImagePreview] = useState<string[]>();

  // P2 state
  const [typingUsers, setTypingUsers] = useState<Record<number, { userId: string; fullName: string }[]>>({});
  const [replyTo, setReplyTo] = useState<any>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [sending, setSending] = useState(false);
  const currentChatRef = useRef<any>(null);
  const lastTypingAt = useRef(0);
  const stopTypingTimer = useRef<any>(null);
  currentChatRef.current = currentChat;

  // Load-more lịch sử (C2): server chỉ trả 50 tin mới nhất khi join;
  // tin cũ hơn lấy qua "loadMoreMessages" { conversationId, beforeId }
  // -> "moreMessages" { conversationId, messages ASC tối đa 50, hasMore }.
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  // Root của ChatLayout (self-scroll) chính là scroll container.
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  // Mirror qua ref để loadMoreOlder giữ identity ổn định: ChatMessageList
  // đăng ký lại IntersectionObserver mỗi khi scrollToTopAction đổi identity,
  // đổi identity giữa chừng sẽ kích hoạt tải lại khi sentinel còn hiện.
  const messagesRef = useRef<any[]>([]);
  const loadMoreGuardRef = useRef({ loading: false, hasMore: true });
  const pendingPrependRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const loadMoreResolveRef = useRef<(() => void) | null>(null);
  // Lần tải đang chạy (nếu có): lần gọi chồng (sentinel + nút bấm cùng
  // tick, trước khi state loading kịp render) trả về cùng Promise thay
  // vì emit lần 2 và ghi đè resolver — nếu không, Promise của lần gọi
  // đầu không bao giờ resolve và spinner đầu danh sách kẹt mãi.
  const loadMoreInflightRef = useRef<Promise<void> | null>(null);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    loadMoreGuardRef.current = { loading: loadingMoreMessages, hasMore: hasMoreMessages };
  }, [loadingMoreMessages, hasMoreMessages]);

  const markRead = (convId?: number) => {
    const id = convId ?? currentChatRef.current?.id;
    if (!id) return;
    socket.emit("markRead", { conversationId: id });
  };

  // Chuỗi "X đang nhập..." cho 1 đoạn chat. Bot thì tên gắn " [BOT AI]"
  // (server chỉ gửi fullName, không gửi cờ bot — tra cờ từ members).
  const typingTextFor = (convId: number, users?: any[]): string | null => {
    const list = (typingUsers[convId] || []).filter((t) => t.userId !== user.id);
    if (list.length === 0) return null;
    const names = list.map((u) => {
      const member = (users || []).find(
        (m: any) => String(m.id) === String(u.userId)
      );
      return typingDisplayName(
        u.fullName || t("notifications.lib.someone"),
        isBotUser(member)
      );
    });
    return buildTypingText(names, t);
  };

  const upsertMessage = (incoming: any) => {
    setMessages((prev: any[]) => {
      const idx = prev.findIndex((m: any) => m.id === incoming.id);
      if (idx === -1) return [...prev, incoming];
      const next = [...prev];
      next[idx] = incoming;
      return next;
    });
  };

  useEffect(() => {
    socket.on("onlineFriends", (friendList: any) => {
      const newOnlineUsers = new Set<string>(friendList);
      setOnlineUsers(newOnlineUsers);
    });
    socket.on("connected", (userid: string) => {
      if (onlineUsers instanceof Set) {
        if (!onlineUsers.has(userid)) {
          const newOnlineUsers = new Set<string>(onlineUsers);
          newOnlineUsers.add(userid);
          setOnlineUsers(newOnlineUsers);
        }
      }
    });
    socket.on("disconnected", (userid: string) => {
      if (onlineUsers instanceof Set) {
        if (onlineUsers.has(userid)) {
          const newOnlineUsers = new Set<string>(onlineUsers);
          newOnlineUsers.delete(userid);
          setOnlineUsers(newOnlineUsers);
        }
      }
    });
  }, [onlineUsers]);
  useEffect(() => {
    socket.on("conversations", (conversations: any) => {
      setConversations(conversations);
    });
  }, [user.id, currentChat]);

  // P2.2 — socket events cho typing / seen / reaction / edit / delete /
  // cập nhật nhóm. Đăng ký 1 lần, dùng functional setState + ref để
  // không kẹt state cũ.
  useEffect(() => {
    const onMessages = (msgs: any) => {
      const list = Array.isArray(msgs) ? msgs : [];
      setMessages(list);
      // Trang đầu tối đa 50 tin: ít hơn 50 nghĩa là đã hết lịch sử.
      setHasMoreMessages(list.length >= 50);
      setLoadingMoreMessages(false);
      loadMoreResolveRef.current?.();
      loadMoreResolveRef.current = null;
    };
    const onNewMessage = (message: any) => {
      const current = currentChatRef.current;
      if (current && message.conversation?.id === current.id) {
        setMessages((prev: any[]) => {
          if (prev.some((m: any) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        // Tin mới tới trong đoạn đang mở -> đánh dấu đã xem luôn.
        if (message.user?.id !== user.id) {
          setTimeout(() => markRead(current.id), 400);
        }
      }
    };
    const onReplace = (message: any) => {
      const current = currentChatRef.current;
      if (current && message.conversation?.id === current.id) upsertMessage(message);
    };
    const onMessagesRead = (data: any) => {
      const current = currentChatRef.current;
      if (!current || data.conversationId !== current.id) return;
      if (data.userId === user.id) return;
      setMessages((prev: any[]) =>
        prev.map((m: any) =>
          data.messageIds.includes(m.id)
            ? { ...m, readBy: Array.from(new Set([...(m.readBy || []), data.userId])) }
            : m
        )
      );
    };
    const onUserTyping = (data: any) => {
      if (data.userId === user.id) return;
      setTypingUsers((prev) => {
        const list = prev[data.conversationId] || [];
        if (list.some((t) => t.userId === data.userId)) return prev;
        return { ...prev, [data.conversationId]: [...list, { userId: data.userId, fullName: data.fullName || "" }] };
      });
    };
    const onUserStoppedTyping = (data: any) => {
      setTypingUsers((prev) => {
        const list = (prev[data.conversationId] || []).filter((t) => t.userId !== data.userId);
        return { ...prev, [data.conversationId]: list };
      });
    };
    const onConversationUpdated = (conv: any) => {
      setConversations((prev: any[]) => {
        const idx = prev.findIndex((c: any) => c.id === conv.id);
        if (idx === -1) return [conv, ...prev];
        const next = [...prev];
        next[idx] = conv;
        return next;
      });
      if (currentChatRef.current?.id === conv.id) {
        setCurrentChat(conv);
      }
    };
    const onConversationRemoved = (data: any) => {
      setConversations((prev: any[]) => prev.filter((c: any) => c.id !== data.id));
      if (currentChatRef.current?.id === data.id) {
        setCurrentChat(undefined);
        setMessages([]);
      }
    };
    // Load-more: server trả "moreMessages" cho đoạn đang mở — prepend
    // vào đầu danh sách, giữ vị trí cuộn qua pendingPrependRef.
    const onMoreMessages = (data: any) => {
      const current = currentChatRef.current;
      if (!current || data.conversationId !== current.id) return;
      const incoming = Array.isArray(data.messages) ? data.messages : [];
      const container = chatScrollRef.current;
      if (container) {
        pendingPrependRef.current = { scrollHeight: container.scrollHeight, scrollTop: container.scrollTop };
      }
      setMessages((prev: any[]) => {
        const seen = new Set(prev.map((m: any) => m.id));
        const fresh = incoming.filter((m: any) => !seen.has(m.id));
        return [...fresh, ...prev];
      });
      setHasMoreMessages(!!data.hasMore);
      setLoadingMoreMessages(false);
      loadMoreResolveRef.current?.();
      loadMoreResolveRef.current = null;
    };
    socket.on("messages", onMessages);
    socket.on("moreMessages", onMoreMessages);
    socket.on("newMessage", onNewMessage);
    socket.on("messageReaction", onReplace);
    socket.on("messageEdited", onReplace);
    socket.on("messageDeleted", onReplace);
    socket.on("messagesRead", onMessagesRead);
    socket.on("userTyping", onUserTyping);
    socket.on("userStoppedTyping", onUserStoppedTyping);
    socket.on("conversationUpdated", onConversationUpdated);
    socket.on("conversationRemoved", onConversationRemoved);
    return () => {
      socket.off("messages", onMessages);
      socket.off("moreMessages", onMoreMessages);
      socket.off("newMessage", onNewMessage);
      socket.off("messageReaction", onReplace);
      socket.off("messageEdited", onReplace);
      socket.off("messageDeleted", onReplace);
      socket.off("messagesRead", onMessagesRead);
      socket.off("userTyping", onUserTyping);
      socket.off("userStoppedTyping", onUserStoppedTyping);
      socket.off("conversationUpdated", onConversationUpdated);
      socket.off("conversationRemoved", onConversationRemoved);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  // Tải 1 trang (~50) tin cũ hơn tin cũ nhất đang hiển thị. Trả Promise
  // để ChatMessageList hiện spinner ở đầu danh sách trong lúc chờ
  // "moreMessages"; timeout 10s để spinner không kẹt nếu server không trả.
  // Auto-scroll xuống cuối khi có tin mới thuộc về ChatLayout
  // (useChatStreamScroll: locked -> bám cuối, unlocked -> hiện nút
  // "xuống cuối" + cờ tin mới), nên không còn scroll thủ công ở đây.
  const loadMoreOlder = useCallback(async () => {
    if (loadMoreInflightRef.current) return loadMoreInflightRef.current;
    const current = currentChatRef.current;
    const guard = loadMoreGuardRef.current;
    const list = messagesRef.current;
    if (!current?.id || guard.loading || !guard.hasMore || list.length === 0) return;
    const oldest = list[0];
    if (!oldest?.id) return;
    setLoadingMoreMessages(true);
    // Chặn lần gọi chồng ngay trong cùng tick (state loading chỉ có
    // hiệu lực sau render, còn sentinel + nút bấm có thể gọi cùng lúc).
    loadMoreGuardRef.current.loading = true;
    const done = new Promise<void>((resolve) => {
      loadMoreResolveRef.current = resolve;
    });
    loadMoreInflightRef.current = done;
    socket.emit("loadMoreMessages", { conversationId: current.id, beforeId: oldest.id });
    const timeout = setTimeout(() => {
      loadMoreResolveRef.current?.();
      loadMoreResolveRef.current = null;
      setLoadingMoreMessages(false);
    }, 10000);
    try {
      await done;
    } finally {
      clearTimeout(timeout);
      loadMoreInflightRef.current = null;
      loadMoreGuardRef.current.loading = false;
    }
  }, []);

  // Giữ vị trí cuộn khi prepend tin cũ: bù đúng chiều cao phần tin mới
  // chèn vào đầu, trước khi trình duyệt kịp vẽ lại.
  useLayoutEffect(() => {
    const pending = pendingPrependRef.current;
    if (!pending) return;
    pendingPrependRef.current = null;
    const container = chatScrollRef.current;
    if (!container) return;
    const delta = container.scrollHeight - pending.scrollHeight;
    if (delta > 0) container.scrollTop = pending.scrollTop + delta;
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    const getConversations = async () => {
      setConversationsLoading(true);
      setConversationsError(false);
      try {
        const res = await axios.get("/messenger/getConversations");
        if (!cancelled) setConversations(res.data.conversations || []);
      } catch (err) {
        console.log(err);
        if (!cancelled) setConversationsError(true);
      } finally {
        if (!cancelled) setConversationsLoading(false);
      }
    };
    getConversations();
    return () => {
      cancelled = true;
    };
  }, [user.id, currentChat, conversationsRefresh]);

  useEffect(() => {
    if (!currentChat?.id) return;
    // Vào phòng theo id — dùng cho cả 1-1 lẫn nhóm (P2.1).
    socket.emit("joinConversationById", currentChat.id);
    setHasMoreMessages(true);
    setLoadingMoreMessages(false);
    setReplyTo(null);
    setShowMembers(false);
    setShowGallery(false);
    markRead(currentChat.id);
    const onFocus = () => markRead(currentChat.id);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat?.id]);

  const emitTyping = () => {
    const current = currentChatRef.current;
    if (!current?.id) return;
    const now = Date.now();
    if (now - lastTypingAt.current < TYPING_REEMIT_MS) return;
    lastTypingAt.current = now;
    socket.emit("typing", { conversationId: current.id });
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    stopTypingTimer.current = setTimeout(() => {
      socket.emit("stopTyping", { conversationId: current.id });
    }, 3000);
  };

  const stopTyping = () => {
    const current = currentChatRef.current;
    if (!current?.id) return;
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    socket.emit("stopTyping", { conversationId: current.id });
  };

  const sendSocketMessage = (payload: any) => {
    socket.emit("sendMessage", payload);
  };

  // ChatComposer onSubmit đã trim sẵn value; giữ nguyên logic gửi cũ
  // (trước đây dùng deferredNewMessage từ input text thường).
  const handleSubmit = (value: string) => {
    if (value !== "" && currentChat.id !== undefined) {
      const message = {
        message: value,
        conversation: {
          id: currentChat?.id,
        },
        user: {
          id: user.id,
        },
        type: MessageType.TEXT,
        parentMessageId: replyTo?.id,
      };
      sendSocketMessage(message);
      setNewMessage("");
      setReplyTo(null);
      stopTyping();
    }
  };

  /** Gửi media (P2.3): ảnh/video qua /image, audio/file qua /files. */
  const sendFiles = async (files: FileList | File[], type: string) => {
    if (!currentChat?.id || !files || files.length === 0) return;
    setSending(true);
    try {
      const list = Array.from(files as unknown as File[]);
      let urls: string[] = [];
      if (type === MessageType.IMAGE || type === MessageType.VIDEO) {
        const formData = new FormData();
        list.forEach((f) => formData.append("images", f));
        const res = await axios.post("/image", formData);
        if (res.data.code === 200 && res.data.images) urls = res.data.images;
      } else {
        const formData = new FormData();
        list.forEach((f) => formData.append("files", f));
        const res = await axios.post("/files", formData);
        const items = res.data?.data;
        if (Array.isArray(items)) {
          urls = items.map((f: any) => f.url).filter(Boolean);
        }
      }
      for (const url of urls) {
        sendSocketMessage({
          message: url,
          conversation: { id: currentChat.id },
          user: { id: user.id },
          type,
        });
      }
      if (urls.length === 0) toast.error(t("messenger.main.uploadFailed"));
    } catch (err) {
      console.log(err);
      toast.error(t("messenger.main.uploadFailed"));
    } finally {
      setSending(false);
      setShowAttach(false);
    }
  };

  const handleSubmitImage = async (e: any) => {
    e.preventDefault();
    if (image && image.length > 0) {
      await sendFiles(image, MessageType.IMAGE);
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

      if (imagePreview === undefined) {
        setImagePreview([...images]);
      }
      if (imagePreview) {
        setImagePreview((result: any) => [...result, ...images]);
      }
      if (image === undefined) {
        setImage([files[0]]);
      }
      if (image) {
        setImage((result: any) => [...result, files[0]]);
      }
    }
  };

  /** P2.3 — gửi vị trí hiện tại (coords + link bản đồ, không dùng SDK). */
  const sendLocation = () => {
    if (!currentChat?.id) return;
    if (!navigator.geolocation) {
      toast.error(t("messenger.main.geoUnsupported"));
      return;
    }
    setShowAttach(false);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        sendSocketMessage({
          message: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          conversation: { id: currentChat.id },
          user: { id: user.id },
          type: MessageType.LOCATION,
        });
      },
      () => toast.error(t("messenger.main.geoFailed")),
      { timeout: 10000 }
    );
  };

  const sendContact = (friend: any) => {
    if (!currentChat?.id) return;
    sendSocketMessage({
      message: JSON.stringify({ fullName: friend.fullName || friend.username, username: friend.username, avatar: friend.avatar }),
      conversation: { id: currentChat.id },
      user: { id: user.id },
      type: MessageType.CONTACT,
    });
    setShowContacts(false);
    setShowAttach(false);
  };

  const sendSticker = (emoji: string) => {
    if (!currentChat?.id) return;
    sendSocketMessage({
      message: emoji,
      conversation: { id: currentChat.id },
      user: { id: user.id },
      type: MessageType.STICKER,
    });
    setShowStickers(false);
    setShowAttach(false);
  };

  // P2.2 — reaction / edit / delete qua socket (server phát lại cho cả phòng).
  const handleReact = (messageId: number, emoji: string) => {
    socket.emit("reactMessage", { messageId, emoji });
  };
  const handleEdit = (message: any, text: string) => {
    if (!text.trim() || text.trim() === message.message) return;
    socket.emit("editMessage", { messageId: message.id, message: text.trim() });
  };
  const handleDelete = (messageId: number) => {
    if (!window.confirm(t("messenger.recallConfirm"))) return;
    socket.emit("deleteMessage", { messageId });
  };
  const handleQuoteClick = (messageId: number) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-accent", "rounded-2xl");
      setTimeout(() => el.classList.remove("ring-2", "ring-accent", "rounded-2xl"), 1500);
    }
  };

  // P2.1 — tạo nhóm / đổi tên / thêm / xóa / rời nhóm.
  const handleCreateGroup = async (name: string, memberIds: string[]) => {
    const res = await axios.post("/messenger/groups", { name, memberIds });
    if (res.data?.conversation) {
      setCurrentChat(res.data.conversation);
      toast.success(t("messenger.main.groupCreated"));
    } else {
      throw new Error("create group failed");
    }
  };
  const handleRenameGroup = async (name: string) => {
    const res = await axios.patch(`/messenger/conversations/${currentChat.id}`, { name });
    if (res.data?.conversation) setCurrentChat(res.data.conversation);
    else throw new Error("rename failed");
  };
  const handleAddMember = async (userId: string) => {
    const res = await axios.post(`/messenger/conversations/${currentChat.id}/members`, { userId });
    if (res.data?.conversation) setCurrentChat(res.data.conversation);
    else throw new Error("add member failed");
  };
  const handleRemoveMember = async (userId: string) => {
    const res = await axios.delete(`/messenger/conversations/${currentChat.id}/members/${userId}`);
    if (res.data?.conversation) setCurrentChat(res.data.conversation);
    else if (res.data?.removed) {
      setCurrentChat(undefined);
      setMessages([]);
    } else throw new Error("remove member failed");
  };
  const handleLeaveGroup = async () => {
    await handleRemoveMember(user.id);
    toast(t("messenger.main.groupLeft"));
  };

  /** Nhãn "Đã xem" dưới tin cuối của mình (P2.2b). */
  const seenLabelFor = (m: any): string | null => {
    if (!currentChat || m.user?.id !== user.id || m.isDeleted) return null;
    const ownMsgs = messages.filter((x: any) => x.user?.id === user.id && !x.isDeleted);
    const lastOwn = ownMsgs[ownMsgs.length - 1];
    if (!lastOwn || lastOwn.id !== m.id) return null;
    const others = (currentChat.users || []).filter((u: any) => u.id !== user.id);
    if (others.length === 0) return null;
    const readers = (m.readBy || []).filter((id: string) => others.some((u: any) => u.id === id));
    if (readers.length === 0) return null;
    if (readers.length === others.length) return t("messenger.seen");
    return t("messenger.main.seenBy", { read: readers.length, total: others.length });
  };

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await axios.get("/friends/my");
      if (res.data.success) {
        setAllUsers(res.data.friends);
      }
    };
    fetchFriends();
  }, []);

  // (Auto-scroll xuống cuối khi có tin mới do ChatLayout đảm nhiệm —
  // useChatStreamScroll; effect scrollRef cũ đã chết vì ref không gắn
  // vào phần tử nào nên bỏ.)

  const renderUserOnline = () => {
    if (onlineUsers.size === 0) return null;
    return (
      <HStack gap={2} className="py-3 px-2 overflow-x-auto">
        {Array.from(onlineUsers).map((u: any) => (
          <OnlineUsers
            key={u}
            onlineUser={u}
            setCurrentChat={setCurrentChat}
          />
        ))}
      </HStack>
    );
  };

  const chatFriend = currentChat?.users?.find((u: any) => u.id !== user.id);
  const chatTitle = currentChat
    ? currentChat.isGroup
      ? currentChat.name || t("messenger.preview.groupFallback")
      : chatFriend?.fullName || chatFriend?.username || ""
    : "";

  // P2.4 — gọi thoại/video (mesh WebRTC) + nút Tham gia cuộc gọi nhóm.
  const callState = useCallStore((s) => s.callState);
  const activeCall = useCallStore((s) => s.activeCall);
  const initiateCall = useCallStore((s) => s.initiateCall);
  const joinCall = useCallStore((s) => s.joinCall);
  const startCall = (type: "voice" | "video") => {
    if (!currentChat?.id) return;
    initiateCall(currentChat.id, chatTitle, !!currentChat.isGroup, type);
  };

  // Mobile 1 cột: quay về danh sách hội thoại. Xóa messages đã mở để
  // lần mở lại sau load mới từ socket (như khi hội thoại bị xóa).
  const goBackToList = () => {
    setCurrentChat(undefined);
    setMessages([]);
    setShowMembers(false);
    setShowGallery(false);
    setReplyTo(null);
  };

  // Input file ẩn cho composer (dùng chung cho cả 2 chế độ composer).
  const hiddenFileInputs = (
    <>
      <input
        type="file"
        id="image-upload"
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        id="video-upload"
        accept="video/*"
        className="hidden"
        onChange={(e) => e.target.files && sendFiles(e.target.files, MessageType.VIDEO)}
      />
      <input
        type="file"
        id="audio-upload"
        accept="audio/*"
        className="hidden"
        onChange={(e) => e.target.files && sendFiles(e.target.files, MessageType.AUDIO)}
      />
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={(e) => e.target.files && sendFiles(e.target.files, MessageType.FILE)}
      />
    </>
  );

  // Nút ảnh + nút đính kèm ở footer composer (hiện ở cả 2 chế độ).
  // Trước đây nằm ở headerActions nên composer có 3 hàng (header +
  // input + footer) và cao ~110px; chuyển xuống footer còn 2 hàng.
  const composerLeadingActions = (
    <>
      <IconButton
        size="sm"
        variant="ghost"
        label={t("messenger.main.sendPhoto")}
        icon={<Icon icon={FiImage} />}
        onClick={() => document.getElementById("image-upload")?.click()}
      />
      <IconButton
        size="sm"
        variant="ghost"
        label={t("messenger.main.attach")}
        icon={<Icon icon={FiPlus} />}
        onClick={() => {
          setShowAttach((v) => !v);
          setShowStickers(false);
          setShowContacts(false);
        }}
      />
    </>
  );

  const replyBar = replyTo ? (
    <HStack gap={2} vAlign="center" className="bg-paper border border-line rounded-lg px-3 py-2">
      <Text size="sm" maxLines={1} className="flex-1 min-w-0">
        {t("messenger.replyTo")} <b>{replyTo.user?.fullName}</b>: {replyTo.message}
      </Text>
      <IconButton
        size="sm"
        variant="ghost"
        label={t("messenger.main.cancelReply")}
        icon={<Icon icon="close" />}
        onClick={() => setReplyTo(null)}
      />
    </HStack>
  ) : null;

  const attachMenu = showAttach ? (
    <List density="compact" className="w-44">
      <ListItem label={t("messenger.main.sendVideo")} onClick={() => document.getElementById("video-upload")?.click()} />
      <ListItem label={t("messenger.main.sendAudio")} onClick={() => document.getElementById("audio-upload")?.click()} />
      <ListItem label={t("messenger.main.sendFile")} onClick={() => document.getElementById("file-upload")?.click()} />
      <ListItem label={t("messenger.main.sendLocation")} onClick={sendLocation} />
      <ListItem label={t("messenger.main.sendContact")} onClick={() => setShowContacts((v) => !v)} />
      <ListItem label={t("messenger.main.sendSticker")} onClick={() => setShowStickers((v) => !v)} />
    </List>
  ) : null;

  const stickerPanel = showStickers ? (
    <HStack gap={1} wrap="wrap" className="w-64">
      {STICKER_SET.map((s) => (
        <button
          key={s.id}
          type="button"
          title={t(`messenger.stickerLabels.${s.id}`)}
          onClick={() => sendSticker(s.emoji)}
          className="text-2xl hover:scale-125 transition-transform">
          {s.emoji}
        </button>
      ))}
    </HStack>
  ) : null;

  const contactPanel = showContacts ? (
    <Stack gap={1} className="w-64 max-h-64 overflow-y-auto">
      <Text size="sm" color="secondary" className="px-2 py-1">
        {t("messenger.main.chooseContact")}
      </Text>
      {(allUsers || []).map((f: any) => (
        <button
          key={f.id}
          type="button"
          onClick={() => sendContact(f)}
          className="block w-full text-left text-sm px-2 py-1.5 hover:bg-paper rounded-lg truncate">
          {f.fullName || f.username}
        </button>
      ))}
    </Stack>
  ) : null;

  // Slash commands: gõ "/" trong composer mở bảng gợi ý (trigger native
  // của ChatComposerInput). Chọn 1 lệnh chèn text lệnh vào composer;
  // gửi đi như tin thường — Bot Client ở daemon parse + xử lý (không
  // xử lý lệnh ở frontend).
  const slashTrigger: ChatComposerTrigger = useMemo(
    () => ({
      character: "/",
      searchSource: createStaticSource(
        (
          [
            { id: "task", label: "/task", insert: "/task ", descKey: "messenger.commands.taskDesc" },
            { id: "tasks", label: "/tasks", insert: "/tasks", descKey: "messenger.commands.tasksDesc" },
            { id: "done", label: "/done", insert: "/done ", descKey: "messenger.commands.doneDesc" },
            { id: "help", label: "/help", insert: "/help", descKey: "messenger.commands.helpDesc" },
            { id: "info", label: "/info", insert: "/info", descKey: "messenger.commands.infoDesc" },
          ] as const
        ).map((c) => ({
          id: c.id,
          label: c.label,
          auxiliaryData: { description: t(c.descKey), insert: c.insert },
        }))
      ),
      renderItem: (item) => {
        const aux = item.auxiliaryData as
          | { description?: string; insert?: string }
          | undefined;
        return (
          <Stack gap={0}>
            <Text weight="semibold" size="sm">
              {item.label}
            </Text>
            <Text size="sm" color="secondary">
              {aux?.description}
            </Text>
          </Stack>
        );
      },
      onSelect: (item) =>
        (item.auxiliaryData as { insert?: string } | undefined)?.insert ??
        item.label,
      menuLabel: t("messenger.commands.menuLabel"),
      emptySearchText: t("messenger.commands.noResults"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale]
  );

  // @mention: gõ "@" trong composer mở bảng gợi ý thành viên của hội
  // thoại đang mở (trigger native của ChatComposerInput, như trigger
  // "/" cho lệnh slash). Chọn 1 người chèn chip @username (xanh) vào
  // composer; lúc gửi, chip serialize thành text "@username " nên Bot
  // Client ở daemon vẫn parse được như cũ (vd @otter, @ai_antigravity).
  const mentionMembers = useMemo(
    () => conversationUsersToMentionItems(currentChat?.users, user.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentChat]
  );

  const mentionTrigger: ChatComposerTrigger = useMemo(
    () => ({
      character: "@",
      searchSource: createStaticSource(mentionMembers, {
        keywords: mentionItemKeywords,
      }),
      renderItem: (item) => {
        const aux = item.auxiliaryData as
          | { username?: string; avatar?: string | null; isBot?: boolean }
          | undefined;
        return (
          <HStack gap={2} vAlign="center">
            <Avatar
              src={aux?.avatar ?? undefined}
              fallbackSrc="/images/user-avatar.png"
              name={item.label}
              size={32}
              tooltip={false}
            />
            <Stack gap={0} className="min-w-0 flex-1">
              <Text weight="semibold" size="sm">
                {item.label}
              </Text>
              <Text size="sm" color="secondary">
                @{aux?.username ?? item.id}
              </Text>
            </Stack>
            {aux?.isBot ? <Badge variant="purple" label="[BOT AI]" /> : null}
          </HStack>
        );
      },
      onSelect: (item) => {
        const aux = item.auxiliaryData as
          | { username?: string }
          | undefined;
        const username = aux?.username ?? item.id;
        return {
          value: `@${username} `,
          label: `@${username}`,
          variant: "blue",
        };
      },
      menuLabel: t("messenger.mentions.menuLabel"),
      emptySearchText: t("messenger.mentions.noResults"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale, mentionMembers]
  );

  // ChatComposer KHÔNG có API đổi input: khi đang chọn ảnh để gửi,
  // composer text được thay bằng khối preview + nút gửi ảnh (như cũ).
  const composerBody = imagePreview ? (
    <Stack gap={3}>
      <HStack gap={3} vAlign="center">
        {composerLeadingActions}
        {hiddenFileInputs}
        <HStack gap={2} wrap="wrap" className="flex-1 min-w-0">
          {imagePreview.map((image, index: number) => (
            <Image
              key={index}
              src={image}
              alt="Pham Thanh Nam"
              width={96}
              height={96}
              className="rounded-lg"
            />
          ))}
        </HStack>
        <IconButton
          size="sm"
          variant="ghost"
          label={t("common.close")}
          icon={<Icon icon="close" />}
          onClick={() => {
            setImage(undefined);
            setImagePreview(undefined);
          }}
        />
        {isLoading ? (
          <button
            onClick={handleSubmitImage}
            disabled={!imagePreview}
            className="inline-flex disabled:cursor-not-allowed gap-2 items-center justify-center border border-transparent rounded-full shadow-sm">
            <RiSendPlaneLine className="h-4 w-4 text-accent-ink rotate-45 rounded-full bg-accent hover:bg-accent/90 focus:outline-none box-content p-3" />
          </button>
        ) : null}
      </HStack>
    </Stack>
  ) : (
    <ChatComposer
      density="compact"
      value={newMessage}
      onChange={(value) => {
        setNewMessage(value);
        emitTyping();
      }}
      onSubmit={handleSubmit}
      placeholder="Aa"
      isDisabled={sending}
      input={<ChatComposerInput pasteAsToken={false} triggers={[slashTrigger, mentionTrigger]} />}
      footerActions={
        <>
          {composerLeadingActions}
          {hiddenFileInputs}
        </>
      }
    />
  );

  return (
    <Stack direction="horizontal" className="relative h-[calc(100vh-4rem-env(safe-area-inset-bottom))] overflow-hidden bg-paper mx-auto shadow-md lg:h-screen">
      {/* <!-- Static sidebar for desktop --> */}
      {allUsers && (
        <ChatUserSearchOffCanvas
          setCurrentChat={setCurrentChat}
          currentId={user.id}
          allUsers={allUsers}
          closeOffCanvas={closeSearchOffCanvas}
          isOffCanvasOpen={isSearchOffCanvasOpen}
        />
      )}
      {showGroupModal && allUsers ? (
        <GroupChatModal
          friends={allUsers}
          onClose={() => setShowGroupModal(false)}
          onCreate={handleCreateGroup}
        />
      ) : null}
      {showWorkflow ? (
        <WorkflowPanel
          isOpen
          onClose={() => setShowWorkflow(false)}
        />
      ) : null}

      <Stack className="min-w-0 flex-1 overflow-hidden">
        {/* topbar */}
        <Navigation />
        {/* end of topbar */}

        <HStack className="flex-1 relative z-0 overflow-hidden">
          {/* Chat user list — mobile 1 cột: chỉ hiện khi chưa mở hội thoại nào;
              từ sm (640px) trở lên luôn hiện song song với khung chat, như cũ. */}
          <Stack
            className={
              currentChat
                ? "hidden sm:flex flex-shrink-0 lg:w-80 2xl:w-96 border-r border-t sm:border-t-0 border-line"
                : "flex-shrink-0 w-full sm:w-auto lg:w-80 2xl:w-96 border-r border-t sm:border-t-0 border-line"
            }>
            {/* tiêu đề + tìm kiếm: trước đây nút tìm kiếm chỉ có icon
                kính lúp trên thanh xám rộng, không có chữ nên khó nhận
                biết; giờ có tiêu đề "Tin nhắn" + nút tạo nhóm, ô tìm
                kiếm full-width có chữ rõ ràng. */}
            <Stack gap={2} className="px-3 pt-3 pb-1">
              <HStack gap={2} vAlign="center">
                <Text size="lg" weight="semibold" className="flex-1 min-w-0">
                  {t("nav.messages")}
                </Text>
                <Button
                  size="sm"
                  variant="secondary"
                  label={t("workflow.openButton")}
                  icon={<Icon icon={FiFileText} />}
                  onClick={() => setShowWorkflow(true)}
                  className="shrink-0 whitespace-nowrap"
                />
                <Button
                  size="sm"
                  variant="primary"
                  label={t("messenger.main.createGroup")}
                  onClick={() => setShowGroupModal(true)}
                  className="shrink-0 whitespace-nowrap"
                />
              </HStack>
              <button
                type="button"
                onClick={openSearchOffCanvas}
                className="cursor-pointer w-full px-3 py-2 rounded-full flex items-center gap-2 bg-surface hover:bg-paper text-muted focus-within:ring-1 focus-within:ring-inset focus-within:ring-accent">
                <FiSearch className="h-5 w-5 shrink-0" />
                <Text size="sm" color="secondary" maxLines={1}>
                  {t("messenger.searchUsers.search")}
                </Text>
              </button>
            </Stack>
            {/* online user list */}
            <Stack className="flex-1 min-h-0 overflow-y-auto">
              {renderUserOnline()}
              {conversationsLoading ? (
                <UserListSkeleton />
              ) : conversationsError ? (
                <Stack gap={3} hAlign="center" className="px-4 py-6 text-center">
                  <Text size="sm" color="secondary">
                    {t("messenger.conversations.loadFailed")}
                  </Text>
                  <Button
                    size="sm"
                    variant="secondary"
                    label={t("common.retry")}
                    onClick={() => setConversationsRefresh((n) => n + 1)}
                  />
                </Stack>
              ) : conversations.length === 0 ? (
                <EmptyState
                  isCompact
                  title={t("messenger.conversations.empty")}
                  description={t("messenger.conversations.emptyHint")}
                  actions={
                    <Button
                      size="sm"
                      variant="primary"
                      label={t("messenger.searchUsers.search")}
                      onClick={openSearchOffCanvas}
                    />
                  }
                />
              ) : (
                <List className="py-2">
                  {conversations
                    ?.map((c: any) => (
                      <ChatUser
                        key={c.id}
                        conversation={c}
                        currentUser={user}
                        currentChat={currentChat}
                        onlineUsers={onlineUsers}
                        typingText={typingTextFor(c.id, c.users)}
                        onSelect={() => setCurrentChat(c)}
                      />
                    ))
                    .reverse()}
                </List>
              )}
            </Stack>
          </Stack>
          {/* Chat user list */}

          {/* Area — mobile 1 cột: chỉ hiện khi đã mở hội thoại (kèm nút back
              ở header); khi chưa mở thì ẩn, chỉ thấy danh sách. Từ sm
              (640px) trở lên luôn hiện song song với danh sách, như cũ. */}
          <Stack
            className={
              currentChat
                ? "flex-1 min-w-0 overflow-hidden bg-paper border-t border-line sm:border-t-0"
                : "hidden sm:flex flex-1 min-w-0 overflow-hidden bg-paper border-t border-line sm:border-t-0"
            }>
            {currentChat ? (
              <>
                {/* chat header: avatar + tên + trạng thái + nút gọi/video.
                    Mobile: nút Media/Thành viên chỉ hiện icon để tên
                    người/nhóm không bị bóp còn 1-2 ký tự (375px). */}
                <HStack gap={3} vAlign="center" className="bg-surface border-b border-line px-2 sm:px-4 py-2">
                  <IconButton
                    className="sm:hidden shrink-0"
                    size="sm"
                    variant="secondary"
                    label={t("common.back")}
                    icon={<FiChevronLeft className="h-5 w-5" />}
                    onClick={goBackToList}
                  />
                  {/* Bấm vào tên/avatar nhóm mở panel thành viên (chỉ nhóm chat). */}
                  <HStack
                    gap={3}
                    vAlign="center"
                    className={`flex-1 min-w-0 ${currentChat.isGroup ? "cursor-pointer" : ""}`}
                    onClick={
                      currentChat.isGroup
                        ? () => {
                            setShowMembers((v) => !v);
                            setShowGallery(false);
                          }
                        : undefined
                    }
                    aria-label={currentChat.isGroup ? t("messenger.main.members") : undefined}>
                    {currentChat.isGroup ? (
                      <AvatarGroup size={36} className="shrink-0">
                        {(currentChat.users || []).slice(0, 2).map((u: any) => (
                          <Avatar
                            key={u.id}
                            src={u.avatar}
                            fallbackSrc="/images/user-avatar.png"
                            name={u.fullName || ""}
                            tooltip={false}
                          />
                        ))}
                      </AvatarGroup>
                    ) : (
                      <Avatar
                        src={chatFriend?.avatar}
                        fallbackSrc="/images/user-avatar.png"
                        name={chatFriend?.fullName || chatFriend?.username || ""}
                        size={36}
                        tooltip={false}
                        status={
                          <AvatarStatusDot
                            variant={onlineUsers.has(chatFriend?.id) ? "success" : "neutral"}
                            label={onlineUsers.has(chatFriend?.id) ? t("messenger.main.online") : t("messenger.main.offline")}
                          />
                        }
                      />
                    )}
                    <Stack gap={0} className="flex-1 min-w-0">
                      <Text weight="semibold" maxLines={1}>
                        {chatTitle}
                      </Text>
                      <Text size="sm" color="secondary" maxLines={1}>
                        {typingTextFor(currentChat.id, currentChat.users) ||
                          (currentChat.isGroup
                            ? t("messenger.main.memberCount", { count: currentChat.users?.length || 0 })
                            : onlineUsers.has(chatFriend?.id) ? t("messenger.main.online") : t("messenger.main.offline"))}
                      </Text>
                    </Stack>
                  </HStack>
                  {currentChat.isGroup ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        label={t("messenger.main.members")}
                        icon={<Icon icon={FiUsers} />}
                        className="hidden sm:inline-flex"
                        onClick={() => {
                          setShowMembers((v) => !v);
                          setShowGallery(false);
                        }}
                      />
                      <IconButton
                        variant="secondary"
                        label={t("messenger.main.members")}
                        icon={<FiUsers className="h-5 w-5" />}
                        className="sm:hidden shrink-0"
                        onClick={() => {
                          setShowMembers((v) => !v);
                          setShowGallery(false);
                        }}
                      />
                    </>
                  ) : null}
                  {/* P2.4 — gọi thoại/video; nhóm đang có cuộc gọi thì hiện Tham gia. */}
                  {activeCall?.conversationId === currentChat.id ? (
                    <Button
                      size="sm"
                      variant="primary"
                      label={t("messenger.main.joinCall")}
                      isDisabled={callState !== "idle"}
                      onClick={() => activeCall && joinCall(activeCall.callId)}
                    />
                  ) : (
                    <>
                      <IconButton
                        variant="secondary"
                        label={t("messenger.voiceCall")}
                        icon={<FiPhone className="h-5 w-5" />}
                        isDisabled={callState !== "idle"}
                        onClick={() => startCall("voice")}
                      />
                      <IconButton
                        variant="secondary"
                        label={t("messenger.videoCall")}
                        icon={<FiVideo className="h-5 w-5" />}
                        isDisabled={callState !== "idle"}
                        onClick={() => startCall("video")}
                      />
                    </>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    label={t("messenger.main.media")}
                    icon={<Icon icon={FiImage} />}
                    className="hidden sm:inline-flex"
                    onClick={() => {
                      setShowGallery((v) => !v);
                      setShowMembers(false);
                    }}
                  />
                  <IconButton
                    variant="secondary"
                    label={t("messenger.main.media")}
                    icon={<FiImage className="h-5 w-5" />}
                    className="sm:hidden shrink-0"
                    onClick={() => {
                      setShowGallery((v) => !v);
                      setShowMembers(false);
                    }}
                  />
                </HStack>
                <HStack className="flex-1 min-h-0 relative">
                  {/* chat body */}
                  <ChatLayout
                    key={currentChat.id}
                    ref={chatScrollRef}
                    className="min-h-0 min-w-0 flex-1"
                    composer={
                      <Stack gap={2} className="mx-auto w-full max-w-2xl px-4 py-3">
                        {replyBar}
                        {attachMenu}
                        {stickerPanel}
                        {contactPanel}
                        {composerBody}
                      </Stack>
                    }>
                    <ChatMessageList
                      gap={2}
                      className="mx-auto w-full max-w-2xl"
                      scrollToTopAction={hasMoreMessages && messages.length > 0 ? loadMoreOlder : undefined}>
                      {hasMoreMessages && messages.length > 0 ? (
                        <Stack hAlign="center" className="py-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            label={loadingMoreMessages ? t("messenger.main.loadingOlder") : t("messenger.main.loadOlder")}
                            isDisabled={loadingMoreMessages}
                            onClick={() => void loadMoreOlder()}
                          />
                        </Stack>
                      ) : null}
                      {messages.map((m: any, i: number) => {
                        // Nhóm tin liên tiếp cùng người gửi (cách nhau < 5 phút):
                        // avatar/tên chỉ ở tin đầu nhóm, thời gian chỉ ở tin
                        // cuối nhóm, góc bo gọn lại. Chỉ tính giao diện —
                        // không động vào logic tải/cuộn tin nhắn.
                        const msgTime = (x: any) => {
                          const t = x?.createAt ?? x?.createdAt;
                          const d = t ? new Date(t).getTime() : NaN;
                          return Number.isNaN(d) ? 0 : d;
                        };
                        const prev = messages[i - 1];
                        const next = messages[i + 1];
                        const sameUser = (a: any, b: any) => !!a && !!b && a.user?.id === b.user?.id;
                        const close = (a: any, b: any) => Math.abs(msgTime(a) - msgTime(b)) < 5 * 60 * 1000;
                        const isFirstInGroup = !sameUser(prev, m) || !close(prev, m);
                        const isLastInGroup = !sameUser(next, m) || !close(next, m);
                        return (
                          <Chat
                            key={m.id}
                            message={m}
                            own={m?.user.id === user?.id}
                            seenLabel={seenLabelFor(m)}
                            isFirstInGroup={isFirstInGroup}
                            isLastInGroup={isLastInGroup}
                            showSenderName={!!currentChat.isGroup}
                            onQuoteClick={handleQuoteClick}
                            onReact={handleReact}
                            onReply={setReplyTo}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        );
                      })}
                      {typingTextFor(currentChat.id, currentChat.users) ? (
                        <Text size="sm" className="text-accent italic">
                          {typingTextFor(currentChat.id, currentChat.users)}
                        </Text>
                      ) : null}
                    </ChatMessageList>
                  </ChatLayout>
                  {showMembers && currentChat.isGroup ? (
                    <GroupMembersPanel
                      conversation={currentChat}
                      currentUserId={user.id}
                      friends={allUsers || []}
                      onClose={() => setShowMembers(false)}
                      onRename={handleRenameGroup}
                      onAddMember={handleAddMember}
                      onRemoveMember={handleRemoveMember}
                      onLeave={handleLeaveGroup}
                    />
                  ) : null}
                  {showGallery ? (
                    <MediaGallery conversationId={currentChat.id} onClose={() => setShowGallery(false)} />
                  ) : null}
                </HStack>
              </>
            ) : (
              <Stack hAlign="center" vAlign="center" className="flex-1 px-6">
                <EmptyState
                  icon={<HiOutlineChatAlt2 className="h-12 w-12" />}
                  title={t("messenger.conversations.openHint")}
                  description={t("messenger.conversations.emptyHint")}
                  actions={
                    <HStack gap={2} wrap="wrap" hAlign="center">
                      <Button
                        size="sm"
                        variant="primary"
                        label={t("messenger.searchUsers.search")}
                        onClick={openSearchOffCanvas}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        label={t("messenger.main.createGroup")}
                        onClick={() => setShowGroupModal(true)}
                      />
                    </HStack>
                  }
                />
              </Stack>
            )}
          </Stack>
        </HStack>
      </Stack>
    </Stack>
  );
};

export default MessagingMain;
