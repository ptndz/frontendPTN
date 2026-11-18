import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiCheck,
  FiCopy,
  FiCornerUpLeft,
  FiEdit2,
  FiPaperclip,
  FiSmile,
  FiTrash2,
} from "react-icons/fi";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import { MessageType } from "./index";
import { REACTION_EMOJIS } from "./stickers";
import { useI18n } from "../../i18n/I18nProvider";
import { isBotUser } from "../../lib/botUsers";
import { tokenizeRichChatText } from "../../lib/chatFormat";
import ActionCard, { parseActionCardData } from "./ActionCard";
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
  seenLabel?: string | null;
  isPinned?: boolean;
  onQuoteClick?: (messageId: number) => void;
  onReact?: (messageId: number, emoji: string) => void;
  onReply?: (message: any) => void;
  onEdit?: (message: any, text: string) => void;
  onDelete?: (messageId: number) => void;
  onPin?: (message: any) => void;
  hideActions?: boolean;
}

/**
 * Telegram-style Fenced Code Block (#18h) — pure React elements (NO dangerouslySetInnerHTML).
 */
const CodeBlockView: React.FC<{ lang: string; code: string }> = ({
  lang,
  code,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Fallback for non-HTTPS contexts (e.g. HTTP Tailscale)
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <div className="my-1.5 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 text-zinc-100 text-left shadow-sm max-w-full">
      <div className="flex items-center justify-between px-3 py-1 bg-zinc-900 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
        <span>{lang || "code"}</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer">
          {copied ? (
            <>
              <FiCheck className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <FiCopy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-2.5 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre text-zinc-100 m-0">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const renderChatText = (text: string): React.ReactNode[] => {
  return tokenizeRichChatText(text).map((tok, idx) => {
    switch (tok.type) {
      case "code_block":
        return <CodeBlockView key={idx} lang={tok.lang} code={tok.code} />;
      case "inline_code":
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-black/15 dark:bg-white/15 font-mono text-[0.85em]">
            {tok.code}
          </code>
        );
      case "mention":
        return (
          <Link key={idx} href={`/${tok.username}`}>
            <Badge variant="blue" label={`@${tok.username}`} />
          </Link>
        );
      case "text":
      default:
        return tok.text;
    }
  });
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

const parseContact = (
  raw: string
): { fullName: string; username?: string; avatar?: string } | null => {
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj.fullName === "string") return obj;
    return null;
  } catch {
    return null;
  }
};

const MessageContent: React.FC<MessageContentProps> = ({
  message,
  own,
  seenLabel,
  isPinned,
  onQuoteClick,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onPin,
  hideActions,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const { t, locale } = useI18n();
  const deleted = !!message.isDeleted;
  const hasActions =
    !hideActions &&
    !deleted &&
    (onReply || onReact || onEdit || onDelete || onPin);
  const bodyColor = own ? "inherit" : undefined;

  const renderBody = () => {
    if (deleted) {
      return (
        <Text
          display="block"
          size="sm"
          color={own ? "inherit" : "secondary"}
          className="italic opacity-70">
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
          <audio
            src={message.message}
            controls
            preload="metadata"
            className="max-w-60"
          />
        );
      case MessageType.FILE: {
        const name = fileNameFromUrl(
          message.message,
          t("messenger.attachment")
        );
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
        if (!loc)
          return (
            <Text display="block" size="sm" color={bodyColor}>
              {message.message}
            </Text>
          );
        const osm = `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=16/${loc.lat}/${loc.lng}`;
        const gmaps = `https://maps.google.com/?q=${loc.lat},${loc.lng}`;
        return (
          <Text display="block" size="sm" color={bodyColor}>
            📍{" "}
            {t("messenger.location", {
              lat: loc.lat.toFixed(5),
              lng: loc.lng.toFixed(5),
            })}
            <br />
            <a
              href={osm}
              target="_blank"
              rel="noreferrer"
              className="underline">
              {t("messenger.openMap")}
            </a>
            {" · "}
            <a
              href={gmaps}
              target="_blank"
              rel="noreferrer"
              className="underline">
              Google Maps
            </a>
          </Text>
        );
      }
      case MessageType.CONTACT: {
        const contact = parseContact(message.message);
        if (!contact)
          return (
            <Text display="block" size="sm">
              {message.message}
            </Text>
          );
        return (
          <HStack gap={2} vAlign="center">
            {contact.avatar ? (
              <Image
                width={32}
                height={32}
                src={contact.avatar}
                alt={contact.fullName}
                className="rounded-full"
              />
            ) : (
              <Avatar name={contact.fullName} size={32} tooltip={false} />
            )}
            <Text size="sm" color={bodyColor}>
              <Text size="sm" weight="medium" color={bodyColor}>
                {contact.fullName}
              </Text>
              {contact.username ? (
                <Text size="sm" color={own ? "inherit" : "secondary"}>
                  {" "}
                  @{contact.username}
                </Text>
              ) : null}
            </Text>
          </HStack>
        );
      }
      case MessageType.STICKER:
        return (
          <Text
            display="block"
            className="text-5xl leading-none"
            role="img"
            aria-label="sticker">
            {message.message}
          </Text>
        );
      case MessageType.URL:
        return (
          <a
            href={message.message}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline break-all">
            {message.message}
          </a>
        );
      case MessageType.TEXT:
      default: {
        const rawText =
          typeof message.message === "string" ? message.message : "";

        // Task #21b: Detect Action Card metadata or structured header
        const actionData = parseActionCardData(rawText);
        if (actionData) {
          return <ActionCard data={actionData} />;
        }
        if (rawText.includes("```")) {
          return (
            <div className="text-sm whitespace-pre-wrap break-words">
              {renderChatText(rawText)}
            </div>
          );
        }
        return (
          <Text
            display="block"
            size="sm"
            color={bodyColor}
            className="whitespace-pre-wrap break-words">
            {renderChatText(rawText)}
          </Text>
        );
      }
    }
  };

  const quote = message.parentMessage;
  return (
    <Stack gap={1} className="group/msg relative">
      {isPinned && !deleted ? (
        <span className="text-[11px] opacity-75 inline-flex items-center gap-1">
          <BsPinAngleFill className="h-3 w-3" />
          {locale === "en" ? "Pinned" : "Đã ghim"}
        </span>
      ) : null}
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
        <Text
          display="block"
          size="sm"
          color={own ? "inherit" : "secondary"}
          className="opacity-60">
          {t("messenger.edited")}
        </Text>
      ) : null}
      {(message.reactions?.length ?? 0) > 0 ? (
        <HStack gap={1} wrap="wrap">
          {message.reactions.map((r: any) => {
            const names = (r.users || [])
              .map((u: any) => u.fullName)
              .filter(Boolean)
              .join(", ");
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
        <Text
          display="block"
          size="sm"
          color={own ? "inherit" : "secondary"}
          className="opacity-60 text-right">
          {seenLabel}
        </Text>
      ) : null}
      {hasActions && !editing ? (
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
          {onPin ? (
            <IconButton
              size="sm"
              variant="ghost"
              label={
                isPinned
                  ? locale === "en"
                    ? "Unpin message"
                    : "Bỏ ghim"
                  : locale === "en"
                    ? "Pin message"
                    : "Ghim tin nhắn"
              }
              icon={
                isPinned ? (
                  <BsPinAngleFill className="h-3.5 w-3.5 text-accent" />
                ) : (
                  <BsPinAngle className="h-3.5 w-3.5" />
                )
              }
              onClick={() => onPin(message)}
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
                <HStack
                  gap={1}
                  className="absolute bottom-7 right-0 bg-surface border border-line rounded-full shadow px-2 py-1">
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
