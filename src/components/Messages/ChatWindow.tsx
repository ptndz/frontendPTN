import { useEffect, useMemo, useRef, useState } from "react";
import { type ChatComposerTrigger } from "@astryxdesign/core/Chat";
import { createSlashCommandTrigger } from "../../lib/slashCommands";
import { conversationUsersToMentionItems, mentionItemKeywords } from "../../lib/mentions";
import { createStaticSource } from "@astryxdesign/core/Typeahead";
import { Badge } from "@astryxdesign/core/Badge";
import { useStoreUser } from "../../store/user";
import { useCallStore } from "../../store/call";
import socket from "../../plugins/socket";
import { isBotUser } from "../../lib/botUsers";
import { typingDisplayName } from "../../lib/typing";
import { useI18n } from "../../i18n/I18nProvider";
import axios from "axios";
import ChatWidget from "./ChatWidget";
import { IStateOpen } from "./WidgetMessage";
import { FiPhone, FiVideo } from "react-icons/fi";
import { MessageType } from "./index";
import { ChatLayout, ChatMessageList, ChatComposer, ChatComposerInput, ChatComposerDrawer } from "@astryxdesign/core/Chat";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Icon } from "@astryxdesign/core/Icon";
import { Avatar } from "@astryxdesign/core/Avatar";
interface IProps {
  chat: IStateOpen;
  onClick: () => void;
}

const ChatWindow: React.FC<IProps> = ({ chat, onClick }) => {
  const { user } = useStoreUser();
  const { t } = useI18n();
  // t() trong callback socket (deps []) -> đọc qua ref để luôn dùng locale mới nhất.
  const tRef = useRef(t);
  tRef.current = t;
  const scrollRef: any = useRef(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [scroll, setScroll] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [typingText, setTypingText] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<any>(null);
  const lastTypingAt = useRef(0);

  // Task #21a: Slash command & @mention autocomplete trong ChatWindow popup
  const slashTrigger: ChatComposerTrigger = useMemo(
    () => createSlashCommandTrigger(t),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  const mentionMembers = useMemo(() => {
    const rawUsers = (chat as any).users || (chat.user ? [chat.user] : []);
    return conversationUsersToMentionItems(rawUsers, user?.id || "");
  }, [chat, user?.id]);

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
        const aux = item.auxiliaryData as { username?: string } | undefined;
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
    [mentionMembers, t]
  );

  // P2.4 — gọi thoại/video từ cửa sổ nổi (đoạn 1-1).
  const callState = useCallStore((s) => s.callState);
  const activeCall = useCallStore((s) => s.activeCall);
  const initiateCall = useCallStore((s) => s.initiateCall);
  const joinCall = useCallStore((s) => s.joinCall);
  const startCall = (type: "voice" | "video") => {
    if (!chat.id) return;
    initiateCall(chat.id, chat.user?.fullName || "", false, type);
  };

  // P2: cửa sổ nổi trước đây emit "chatWindowJoinConversation" và nghe
  // "chatWindowMessages" — cả 2 event đều không tồn tại ở server nên
  // widget chưa từng tải được tin nhắn. Dùng joinConversationById +
  // REST lấy tin nhắn như trang messenger (event "messages" của server
  // không kèm id đoạn chat nên không phân biệt được khi mở nhiều cửa sổ).
  useEffect(() => {
    if (!chat.id) return;
    socket.emit("joinConversationById", chat.id);
    let cancelled = false;
    axios
      .get(`/messenger/conversations/${chat.id}/messages?limit=50`)
      .then((res) => {
        if (!cancelled && res.data?.messages) {
          setMessages(res.data.messages);
          setScroll("smooth");
        }
      })
      .catch(() => {});
    socket.emit("markRead", { conversationId: chat.id });
    return () => {
      cancelled = true;
    };
  }, [chat.id]);

  useEffect(() => {
    const onNewMessage = (message: any) => {
      if (message.conversation?.id !== chat.id) return;
      setMessages((prev) => {
        if (prev.some((m: any) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setScroll(`smooth${message.id}`);
      if (message.user?.id !== user.id) {
        setTimeout(() => socket.emit("markRead", { conversationId: chat.id }), 400);
      }
    };
    const onReplace = (message: any) => {
      if (message.conversation?.id !== chat.id) return;
      setMessages((prev) => prev.map((m: any) => (m.id === message.id ? message : m)));
    };
    const onMessagesRead = (data: any) => {
      if (data.conversationId !== chat.id || data.userId === user.id) return;
      setMessages((prev) =>
        prev.map((m: any) =>
          data.messageIds.includes(m.id)
            ? { ...m, readBy: Array.from(new Set([...(m.readBy || []), data.userId])) }
            : m
        )
      );
    };
    const onTyping = (data: any) => {
      if (data.conversationId !== chat.id || data.userId === user.id) return;
      // Server chỉ gửi fullName, không gửi cờ bot — tra cờ từ chat.user
      // (cửa sổ nổi mở theo 1 đối tác). Không khớp thì coi như người thường.
      const member =
        String(data.userId) === String(chat.user?.id) ? chat.user : null;
      const name = data.fullName
        ? typingDisplayName(data.fullName, isBotUser(member))
        : "";
      setTypingText(
        name
          ? tRef.current("messenger.typing", { name })
          : tRef.current("messenger.someoneTyping")
      );
    };
    const onStoppedTyping = (data: any) => {
      if (data.conversationId !== chat.id || data.userId === user.id) return;
      setTypingText(null);
    };
    socket.on("newMessage", onNewMessage);
    socket.on("messageReaction", onReplace);
    socket.on("messageEdited", onReplace);
    socket.on("messageDeleted", onReplace);
    socket.on("messagesRead", onMessagesRead);
    socket.on("userTyping", onTyping);
    socket.on("userStoppedTyping", onStoppedTyping);
    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageReaction", onReplace);
      socket.off("messageEdited", onReplace);
      socket.off("messageDeleted", onReplace);
      socket.off("messagesRead", onMessagesRead);
      socket.off("userTyping", onTyping);
      socket.off("userStoppedTyping", onStoppedTyping);
    };
  }, [chat.id, user.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [scroll]);

  const emitTyping = () => {
    const now = Date.now();
    if (now - lastTypingAt.current < 2000) return;
    lastTypingAt.current = now;
    socket.emit("typing", { conversationId: chat.id });
    setTimeout(() => socket.emit("stopTyping", { conversationId: chat.id }), 3000);
  };

  // ChatComposer onSubmit đã trim sẵn value; giữ nguyên logic gửi cũ
  // (trước đây dùng deferredNewMessage).
  const handleSubmit = (value: string) => {
    if (value !== "" && chat.id !== undefined) {
      const message = {
        message: value,
        conversation: {
          id: chat?.id,
        },
        user: {
          id: user.id,
        },
        type: MessageType.TEXT,
        parentMessageId: replyTo?.id,
      };
      socket.emit("sendMessage", message);
      socket.emit("stopTyping", { conversationId: chat.id });
      setNewMessage("");
      setReplyTo(null);
      setScroll(value);
    }
  };

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
    document.getElementById(`msg-${messageId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const seenLabelFor = (m: any): string | null => {
    if (m.user?.id !== user.id || m.isDeleted) return null;
    const ownMsgs = messages.filter((x: any) => x.user?.id === user.id && !x.isDeleted);
    const lastOwn = ownMsgs[ownMsgs.length - 1];
    if (!lastOwn || lastOwn.id !== m.id) return null;
    return (m.readBy || []).length > 0 ? t("messenger.seen") : null;
  };

  if (chat.isOpen) {
    return (
      <Stack className="bg-surface rounded-xl shadow-md overflow-hidden h-148 w-96">
        <HStack gap={2} vAlign="center" className="px-4 py-2 bg-paper">
          <Avatar
            src={chat.user?.avatar}
            fallbackSrc="/images/user-avatar.png"
            name={chat.user?.fullName}
            size={32}
            tooltip={false}
          />
          <Text size="sm" weight="semibold" color="secondary" maxLines={1} className="flex-1 min-w-0">
            {chat.user?.fullName}
          </Text>
          {/* P2.4 — gọi thoại/video */}
          {activeCall?.conversationId === chat.id ? (
            <Button
              size="sm"
              variant="primary"
              label={t("messenger.join")}
              isDisabled={callState !== "idle"}
              onClick={() => joinCall(activeCall.callId)}
            />
          ) : (
            <HStack gap={1} vAlign="center">
              <IconButton
                size="sm"
                variant="ghost"
                label={t("messenger.voiceCall")}
                icon={<FiPhone className="h-4 w-4" />}
                isDisabled={callState !== "idle"}
                onClick={() => startCall("voice")}
              />
              <IconButton
                size="sm"
                variant="ghost"
                label={t("messenger.videoCall")}
                icon={<FiVideo className="h-4 w-4" />}
                isDisabled={callState !== "idle"}
                onClick={() => startCall("video")}
              />
            </HStack>
          )}
          <Button size="sm" variant="ghost" label={t("messenger.close")} onClick={onClick} />
        </HStack>
        <ChatLayout
          key={chat.id}
          density="compact"
          className="min-h-0 flex-1"
          composer={
            <ChatComposer
              density="compact"
              value={newMessage}
              onChange={(value) => {
                setNewMessage(value);
                emitTyping();
              }}
              onSubmit={handleSubmit}
              placeholder="Aa"
              input={<ChatComposerInput pasteAsToken={false} triggers={[slashTrigger, mentionTrigger]} />}
              drawer={
                replyTo ? (
                  <ChatComposerDrawer>
                    <HStack gap={2} vAlign="center">
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
                  </ChatComposerDrawer>
                ) : undefined
              }
            />
          }>
          <ChatMessageList density="compact">
            {messages.map((message: any) => (
              <ChatWidget
                key={message.id}
                message={message}
                own={message?.user.id === user?.id}
                seenLabel={seenLabelFor(message)}
                onQuoteClick={handleQuoteClick}
                onReact={handleReact}
                onReply={setReplyTo}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            {typingText ? (
              <Text size="sm" className="text-accent italic">
                {typingText}
              </Text>
            ) : null}
          </ChatMessageList>
        </ChatLayout>
      </Stack>
    );
  }
  return null;
};

export default ChatWindow;
