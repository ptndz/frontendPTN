import { useEffect, useState } from "react";
import moment from "moment";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { queryGetUserByUsername } from "../../graphql/user";
import { User } from "../../gql/graphql";
import { useI18n } from "../../i18n/I18nProvider";
import { ListItem } from "@astryxdesign/core/List";
import { Avatar, AvatarStatusDot } from "@astryxdesign/core/Avatar";
import { AvatarGroup } from "@astryxdesign/core/AvatarGroup";
import { Text } from "@astryxdesign/core/Text";
import { Stack } from "@astryxdesign/core/Stack";

interface IProps {
  conversation: any;
  currentUser: User;
  currentChat: any;
  onlineUsers: any;
  /** "X đang nhập..." trong đoạn này (P2.2a) — null nếu không ai nhập. */
  typingText?: string | null;
  onSelect?: () => void;
}

const ChatUser: React.FC<IProps> = ({
  conversation,
  currentUser,
  currentChat,
  onlineUsers,
  typingText,
  onSelect,
}) => {
  const { t } = useI18n();
  const [userData, setUserData] = useState<User>();
  const isGroup = !!conversation.isGroup;
  const friend: User | undefined = isGroup
    ? undefined
    : conversation.users.find((u: User) => u.id !== currentUser.id);
  const [isOnline, setIsOnline] = useState(false);
  useEffect(() => {
    if (!friend) return;
    const getUser = async () => {
      try {
        const res = await graphQLClient.request(queryGetUserByUsername, {
          username: friend.username,
        });
        if (graphQLClientErrorCheck(res)) {
          if (res.getUser.user) setUserData(res.getUser.user);
        }
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, [currentUser, conversation, friend]);

  useEffect(() => {
    if (onlineUsers.size > 0) {
      setIsOnline(!!Array.from(onlineUsers).find((u) => u === userData?.id));
    }
  }, [onlineUsers, userData?.id]);

  const displayName = isGroup
    ? conversation.name || t("messenger.preview.groupFallback")
    : userData?.fullName || friend?.fullName || friend?.username || "";
  const avatar = isGroup ? null : userData?.avatar || friend?.avatar;
  const lastMessage = conversation.lastMessage;
  // Chưa đọc: tin cuối không phải của mình và mình chưa có trong readBy.
  // API không trả unreadCount nên chỉ có trạng thái có/không (chấm đen),
  // không có số lượng. Ẩn khi đang mở chính hội thoại này.
  const isUnread =
    !!lastMessage &&
    lastMessage.user?.id !== currentUser.id &&
    !(lastMessage.readBy || []).includes(currentUser.id) &&
    currentChat?.id !== conversation.id;
  const lastTime = lastMessage?.createAt ?? lastMessage?.createdAt;
  const lastPreview = lastMessage
    ? lastMessage.isDeleted
      ? t("messenger.preview.recalled")
      : lastMessage.type === "IMAGE"
        ? t("messenger.preview.sentPhoto")
        : lastMessage.type === "VIDEO"
          ? t("messenger.preview.sentVideo")
          : lastMessage.type === "AUDIO"
            ? t("messenger.preview.sentAudio")
            : lastMessage.type === "FILE"
              ? t("messenger.preview.sentFile")
              : lastMessage.type === "LOCATION"
                ? t("messenger.preview.sentLocation")
                : lastMessage.type === "STICKER"
                  ? `${lastMessage.message}${t("messenger.preview.stickerSuffix")}`
                  : lastMessage.type === "CONTACT"
                    ? t("messenger.preview.sentContact")
                    : lastMessage.message
    : "";

  return (
    <ListItem
      align="first-line"
      label={
        <>
          {isUnread ? (
            <Text size="sm" weight="semibold">
              {displayName}
            </Text>
          ) : (
            displayName
          )}
          {isGroup ? (
            <Text size="sm" color="secondary">
              {" "}
              ({conversation.users?.length || 0})
            </Text>
          ) : null}
        </>
      }
      description={
        typingText ? (
          <Text size="sm" className="text-accent italic">
            {typingText}
          </Text>
        ) : isUnread ? (
          <Text size="sm" weight="medium">
            {lastPreview}
          </Text>
        ) : (
          lastPreview || undefined
        )
      }
      endContent={
        <Stack gap={1} hAlign="end" className="shrink-0">
          {lastTime ? (
            <Text size="sm" color="secondary">
              {moment(lastTime).fromNow()}
            </Text>
          ) : null}
          {isUnread ? (
            <Text aria-label={t("messenger.main.unread")} className="h-2.5 w-2.5 rounded-full bg-accent">
              {""}
            </Text>
          ) : null}
        </Stack>
      }
      startContent={
        isGroup ? (
          <AvatarGroup size={40}>
            {(conversation.users || []).slice(0, 2).map((u: any) => (
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
            src={avatar || undefined}
            fallbackSrc="/images/user-avatar.png"
            name={displayName}
            size={40}
            tooltip={false}
            status={
              <AvatarStatusDot
                variant={isOnline ? "success" : "neutral"}
                label={isOnline ? t("messenger.main.online") : t("messenger.main.offline")}
              />
            }
          />
        )
      }
      isSelected={currentChat?.id === conversation.id}
      onClick={onSelect}
    />
  );
};

export default ChatUser;
