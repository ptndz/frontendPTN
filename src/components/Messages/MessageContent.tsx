import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiCornerUpLeft, FiEdit2, FiPaperclip, FiSmile, FiTrash2 } from "react-icons/fi";
import { MessageType } from "./index";
import { REACTION_EMOJIS } from "./stickers";
import { useI18n } from "../../i18n/I18nProvider";
import { isBotUser } from "../../lib/botUsers";
import { splitMentionText } from "../../lib/mentions";
import { Badge } from "@astryxdesign/core/Badge";
import { HStack } from "@astryxdesign/core/HStack";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Icon } from "@astryxdesign/core/Icon";
import { Avatar } from "@astryxdesign/core/Avatar";
import { TextInput } from "@astryxdesign/core/TextInput";

export interface MessageContentProps {
  message: any;
  own: boolean;
  /** Nhãn "Đã xem" / "Đã xem bởi n" — chỉ truyền cho tin cuối của mình. */
  seenLabel?: string | null;
  onQuoteClick?: (messageId: number) => void;
  onReact?: (messageId: number, emoji: string) => void;
  onReply?: (message: any) => void;
  onEdit?: (message: any, text: string) => void;
  onDelete?: (messageId: number) => void;
  /** Ẩn thanh thao tác (vd trong gallery) — mặc định hiện khi có callback. */
  hideActions?: boolean;
}

/**
 * Render nội dung text: @username thành chip xanh (Badge variant="blue",
 * link tới trang cá nhân). Không dùng renderRichText ở đây vì nó tô
 * mention bằng text-accent-bright — màu đen trong theme Mono.
 * Quote giữ text thường (không nhét Link/Badge vào trong <button>).
 */
const renderChatText = (text: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let key = 0;
  for (const part of splitMentionText(text)) {
    if (part.type === "mention") {
      nodes.push(
        <Link key={key++} href={`/${part.username}`}>
          <Badge variant="blue" label={`@${part.username}`} />
        </Link>
      );
    } else {
      nodes.push(part.text);
    }
  }
  return nodes;
};

const fileNameFromUrl = (url: string, fallback: string): string => {
  try {
    const clean = decodeURIComponent(url.split("?")[0]);
    return clean.split("/").pop() || fallback;
  } catch {
    return fallback;
  }
};

const parseLocation = (raw: string): { lat: number; lng: number } | null => {
  try {
    const obj = JSON.parse(raw);
    if (typeof obj.lat === "number" && typeof obj.lng === "number") return obj;
    return null;
  } catch {
    const m = raw.split(",").map((s) => parseFloat(s.trim()));
    if (m.length === 2 && m.every((n) => !Number.isNaN(n))) {
      return { lat: m[0], lng: m[1] };
    }
    return null;
  }
};

const parseContact = (raw: string): { fullName: string; username?: string; avatar?: string } | null => {
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj.fullName === "string") return obj;
    return null;
  } catch {
    return null;
  }
};

/**
 * Nội dung 1 tin nhắn chat — dùng chung cho Chat (trang messenger) và
 * ChatWidget (cửa sổ nổi). Render đủ các type đã khai báo trong
 * MessageType (P2.3): TEXT / IMAGE / VIDEO / AUDIO / FILE / LOCATION /
 * CONTACT / STICKER / URL, kèm quote (P2.2d), reactions (P2.2c),
 * "đã chỉnh sửa" / thu hồi (P2.2e) và nhãn "Đã xem" (P2.2b).
 * Hiển thị trong ChatMessageBubble (filled cho text, ghost cho media).
 */
const MessageContent: React.FC<MessageContentProps> = ({
  message,
  own,
  seenLabel,
  onQuoteClick,
  onReact,
  onReply,
  onEdit,
  onDelete,
  hideActions,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const { t } = useI18n();
  const deleted = !!message.isDeleted;
  const hasActions = !hideActions && !deleted && (onReply || onReact || onEdit || onDelete);
  // Bong bóng của mình nền đen (theme override) — chữ bên trong kế thừa
  // màu trắng của bubble; Text mặc định màu ink sẽ chìm trên nền đen.
  const bodyColor = own ? "inherit" : undefined;

  const renderBody = () => {
    if (deleted) {
      return (
        <Text display="block" size="sm" color={own ? "inherit" : "secondary"} className="italic opacity-70">
          {t("messenger.recalled")}
        </Text>
      );
    }
    switch (message.type) {
      case MessageType.IMAGE:
        return (
          <Image
            width={300}
            height={300}
            src={message.message}
            alt={message.user?.fullName || t("messenger.imageAlt")}
            className="rounded-lg"
          />
        );
      case MessageType.VIDEO:
        return (
          <video
            src={message.message}
            controls
            preload="metadata"
            className="rounded-lg max-w-xs w-full"
          />
        );
      case MessageType.AUDIO:
        return (
          <audio src={message.message} controls preload="metadata" className="max-w-60" />
        );
      case MessageType.FILE: {
        const name = fileNameFromUrl(message.message, t("messenger.attachment"));
        return (
          <a
            href={message.message}
            target="_blank"
            rel="noreferrer"
            download={name}
            className="flex items-center gap-2 text-sm underline break-all">
            <Icon icon={FiPaperclip} size="sm" />
            {name}
          </a>
        );
      }
      case MessageType.LOCATION: {
        const loc = parseLocation(message.message);
        if (!loc) return <Text display="block" size="sm" color={bodyColor}>{message.message}</Text>;
        const osm = `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=16/${loc.lat}/${loc.lng}`;
        const gmaps = `https://maps.google.com/?q=${loc.lat},${loc.lng}`;
        return (
          <Text display="block" size="sm" color={bodyColor}>
            📍 {t("messenger.location", { lat: loc.lat.toFixed(5), lng: loc.lng.toFixed(5) })}
            <br />
            <a href={osm} target="_blank" rel="noreferrer" className="underline">
              {t("messenger.openMap")}
            </a>
            {" · "}
            <a href={gmaps} target="_blank" rel="noreferrer" className="underline">
              Google Maps
            </a>
          </Text>
        );
      }
      case MessageType.CONTACT: {
        const contact = parseContact(message.message);
        if (!contact) return <Text display="block" size="sm">{message.message}</Text>;
        return (
          <HStack gap={2} vAlign="center">
            {contact.avatar ? (
              <Image width={32} height={32} src={contact.avatar} alt={contact.fullName} className="rounded-full" />
            ) : (
              <Avatar name={contact.fullName} size={32} tooltip={false} />
            )}
            <Text size="sm" color={bodyColor}>
              <Text size="sm" weight="medium" color={bodyColor}>{contact.fullName}</Text>
              {contact.username ? <Text size="sm" color={own ? "inherit" : "secondary"}> @{contact.username}</Text> : null}
            </Text>
          </HStack>
        );
      }
      case MessageType.STICKER:
        return (
          <Text display="block" className="text-5xl leading-none" role="img" aria-label="sticker">
            {message.message}
          </Text>
        );
      case MessageType.URL:
        return (
          <a href={message.message} target="_blank" rel="noreferrer" className="text-sm underline break-all">
            {message.message}
          </a>
        );
      case MessageType.TEXT:
      default:
        return <Text display="block" size="sm" color={bodyColor} className="whitespace-pre-wrap break-words">{renderChatText(message.message)}</Text>;
    }
  };

  const quote = message.parentMessage;
  return (
    <Stack gap={1} className="group/msg relative">
      {quote ? (
        <button
          type="button"
          onClick={() => onQuoteClick?.(quote.id)}
          title={t("messenger.viewOriginal")}
          className="block max-w-full text-left text-xs opacity-70 border-l-2 border-current pl-2 mb-1 truncate">
          {quote.user?.fullName
            ? `${isBotUser(quote.user) ? "[BOT AI] " : ""}${quote.user.fullName}: `
            : ""}
          {quote.message}
        </button>
      ) : null}
      {editing ? (
        <HStack gap={2} vAlign="center">
          <TextInput
            label={t("messenger.edit")}
            isLabelHidden
            hasAutoFocus
            value={editText}
            onChange={(value) => setEditText(value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onEdit?.(message, editText);
                setEditing(false);
              }
              if (e.key === "Escape") setEditing(false);
            }}
            containerClassName="w-56"
          />
          <Button
            size="sm"
            variant="ghost"
            label={t("messenger.save")}
            onClick={() => {
              onEdit?.(message, editText);
              setEditing(false);
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            label={t("messenger.cancel")}
            onClick={() => setEditing(false)}
          />
        </HStack>
      ) : (
        renderBody()
      )}
      {message.isEdited && !deleted ? (
        <Text display="block" size="sm" color={own ? "inherit" : "secondary"} className="opacity-60">{t("messenger.edited")}</Text>
      ) : null}
      {(message.reactions?.length ?? 0) > 0 ? (
        <HStack gap={1} wrap="wrap">
          {message.reactions.map((r: any) => {
            const names = (r.users || []).map((u: any) => u.fullName).filter(Boolean).join(", ");
            return (
              <button
                key={r.emoji}
                type="button"
                title={names}
                onClick={() => onReact?.(message.id, r.emoji)}
                className="text-xs bg-paper border border-line rounded-full px-2 py-0.5 shadow-sm">
                {r.emoji} {r.count}
              </button>
            );
          })}
        </HStack>
      ) : null}
      {seenLabel ? (
        <Text display="block" size="sm" color={own ? "inherit" : "secondary"} className="opacity-60 text-right">{seenLabel}</Text>
      ) : null}
      {hasActions && !editing ? (
        // Giữ <span> + group-hover ở đây: thanh thao tác hiện khi hover
        // cả khi con trỏ đã ra ngoài biên bubble (nằm phía trên -top-7);
        // display utilities trên component Astryx sẽ thua StyleX display.
        <span className="absolute -top-7 right-0 hidden group-hover/msg:flex gap-1 bg-surface border border-line rounded-full shadow px-1 py-0.5 z-10">
          {onReply ? (
            <IconButton
              size="sm"
              variant="ghost"
              label={t("messenger.reply")}
              icon={<Icon icon={FiCornerUpLeft} />}
              onClick={() => onReply(message)}
            />
          ) : null}
          {onReact ? (
            <Stack className="relative">
              <IconButton
                size="sm"
                variant="ghost"
                label={t("messenger.react")}
                icon={<Icon icon={FiSmile} />}
                onClick={() => setShowPicker((v) => !v)}
              />
              {showPicker ? (
                <HStack gap={1} className="absolute bottom-7 right-0 bg-surface border border-line rounded-full shadow px-2 py-1">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        onReact(message.id, emoji);
                        setShowPicker(false);
                      }}
                      className="text-base hover:scale-125 transition-transform">
                      {emoji}
                    </button>
                  ))}
                </HStack>
              ) : null}
            </Stack>
          ) : null}
          {own && onEdit && message.type === MessageType.TEXT ? (
            <IconButton
              size="sm"
              variant="ghost"
              label={t("messenger.edit")}
              icon={<Icon icon={FiEdit2} />}
              onClick={() => {
                setEditText(message.message);
                setEditing(true);
              }}
            />
          ) : null}
          {own && onDelete ? (
            <IconButton
              size="sm"
              variant="ghost"
              label={t("messenger.recall")}
              icon={<Icon icon={FiTrash2} />}
              onClick={() => onDelete(message.id)}
            />
          ) : null}
        </span>
      ) : null}
    </Stack>
  );
};

export default MessageContent;
