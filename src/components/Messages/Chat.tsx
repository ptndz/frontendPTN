import moment from "moment";
import { useI18n } from "../../i18n/I18nProvider";
import MessageContent from "./MessageContent";
import { MessageType } from "./index";
import { isBotUser } from "../../lib/botUsers";
import { ChatMessage } from "@astryxdesign/core/Chat";
import { ChatMessageBubble } from "@astryxdesign/core/Chat";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";

interface IProps {
  message: any;
  own: boolean;
  /** Nhãn "Đã xem" — chỉ truyền cho tin cuối của mình (P2.2b). */
  seenLabel?: string | null;
  onQuoteClick?: (messageId: number) => void;
  onReact?: (messageId: number, emoji: string) => void;
  onReply?: (message: any) => void;
  onEdit?: (message: any, text: string) => void;
  onDelete?: (messageId: number) => void;
  onPin?: (message: any) => void;
  isPinned?: boolean;
  /** Tin đầu nhóm tin liên tiếp cùng người gửi: hiện avatar + tên. */
  isFirstInGroup?: boolean;
  /** Tin cuối nhóm: hiện thời gian (chỉ 1 lần / nhóm). */
  isLastInGroup?: boolean;
  /** Hiện tên người gửi ở tin đầu nhóm (chỉ nhóm chat; 1-1 đã có tên ở header). */
  showSenderName?: boolean;
}

/** Tin media không dùng bubble filled (cap 280px bóp ảnh 300px) mà dùng ghost. */
const isMediaMessage = (message: any) =>
  message.type === MessageType.IMAGE ||
  message.type === MessageType.VIDEO ||
  message.type === MessageType.AUDIO ||
  message.type === MessageType.FILE ||
  message.type === MessageType.LOCATION ||
  message.type === MessageType.CONTACT ||
  message.type === MessageType.STICKER;

/** API trả `createAt` (không phải `createdAt`) — dùng sai thì moment
 *  nhận undefined và mọi tin đều hiện "vài giây trước". */
const messageTime = (message: any) => message.createAt ?? message.createdAt;

const Chat: React.FC<IProps> = ({
  message,
  own,
  seenLabel,
  onQuoteClick,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onPin,
  isPinned,
  isFirstInGroup = true,
  isLastInGroup = true,
  showSenderName = false,
}) => {
  const user = message.user;
  // Bot account (thiết kế mục 4.2): `user.isBot` là optional — backend
  // đang thêm cờ này song song; isBotUser() dự phòng bằng username
  // (ai_nyx / ai_antigravity / ai_chatgpt) nên không crash khi cờ vắng.
  // Tin trạng thái task là TEXT thường (v1) — render như tin thường,
  // không có card riêng.
  const isBot = isBotUser(user);
  // Đăng ký context để render lại khi đổi ngôn ngữ: fromNow() bên dưới
  // đọc locale moment toàn cục, nếu không subscribe thì giữ chuỗi cũ.
  useI18n();

  // Vị trí trong nhóm tin liên tiếp: bo góc sender-side gọn lại
  // (first: chặt góc dưới, middle: chặt cả 2, last: chặt góc trên).
  const group = !isFirstInGroup && !isLastInGroup
    ? "middle"
    : !isFirstInGroup
      ? "last"
      : !isLastInGroup
        ? "first"
        : undefined;

  return (
    <ChatMessage
      id={`msg-${message.id}`}
      sender={own ? "user" : "assistant"}
      avatar={
        // Tin của mình không hiện avatar (như Messenger); tin người
        // khác chỉ hiện ở tin cuối nhóm để nhóm gọn lại.
        !own && isLastInGroup ? (
          <Avatar
            src={user?.avatar}
            fallbackSrc="/images/user-avatar.png"
            name={user?.fullName}
            size={32}
            tooltip={false}
          />
        ) : undefined
      }>
      <ChatMessageBubble
        variant={isMediaMessage(message) ? "ghost" : "filled"}
        group={group}
        name={
          // Tin bot luôn hiện tên + nhãn [BOT AI] (kể cả chat 1-1, nơi
          // showSenderName=false) để phân biệt với user thường; tin
          // người thường giữ nguyên hành vi cũ (chỉ hiện tên khi
          // showSenderName, vd nhóm chat).
          !own && isFirstInGroup && (showSenderName || isBot) ? (
            isBot ? (
              <HStack gap={2} vAlign="center">
                <Text size="sm" weight="semibold">
                  {user?.fullName}
                </Text>
                <Badge variant="purple" label="[BOT AI]" />
              </HStack>
            ) : (
              user?.fullName
            )
          ) : undefined
        }
        metadata={
          isLastInGroup ? (
            <Text size="sm" color="secondary">
              {moment(messageTime(message)).fromNow()}
            </Text>
          ) : undefined
        }>
        <MessageContent
          message={message}
          own={own}
          seenLabel={seenLabel}
          onQuoteClick={onQuoteClick}
          onReact={onReact}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onPin={onPin}
          isPinned={isPinned}
        />
      </ChatMessageBubble>
    </ChatMessage>
  );
};

export default Chat;
