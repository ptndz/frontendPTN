import Chat from "./Chat";
interface IProps {
  message: any;
  own: boolean;
  seenLabel?: string | null;
  onQuoteClick?: (messageId: number) => void;
  onReact?: (messageId: number, emoji: string) => void;
  onReply?: (message: any) => void;
  onEdit?: (message: any, text: string) => void;
  onDelete?: (messageId: number) => void;
}
/**
 * Hàng tin nhắn trong cửa sổ chat nổi — cùng render với Chat ở trang
 * messenger (ChatMessage + ChatMessageBubble), chỉ khác nơi dùng.
 */
const ChatWidget: React.FC<IProps> = (props) => <Chat {...props} />;

export default ChatWidget;
