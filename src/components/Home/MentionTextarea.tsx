import React, { useEffect, useRef, useState } from "react";
import { searchUsersForMention } from "../../lib/social";
import type { MentionUser } from "../../types/social";
import { Avatar } from "@astryxdesign/core/Avatar";
import { VStack } from "@astryxdesign/core/VStack";
import { Text } from "@astryxdesign/core/Text";
import { useI18n } from "../../i18n/I18nProvider";

interface IProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
}

/**
 * P1.6 — Textarea có gợi ý @mention. Gõ @ + vài ký tự -> dropdown user
 * từ GET /user/search?keyword= (debounce 300ms). Click 1 user để chèn
 * @username + khoảng trắng. Esc đóng gợi ý. Không chiếm phím Enter
 * (Enter vẫn xuống dòng như textarea thường).
 */
const MentionTextarea: React.FC<IProps> = ({
  value,
  onChange,
  textareaRef,
  ...rest
}) => {
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const [mentionRange, setMentionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const setRefs = (el: HTMLTextAreaElement | null) => {
    innerRef.current = el;
    if (typeof textareaRef === "function") textareaRef(el);
    else if (textareaRef && typeof textareaRef === "object") {
      (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current =
        el;
    }
  };

  useEffect(() => {
    if (!mentionRange) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const keyword = value
      .slice(mentionRange.start + 1, mentionRange.end)
      .trim();
    if (keyword.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const users = await searchUsersForMention(keyword);
        setSuggestions(users);
        setOpen(users.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, mentionRange]);

  const detectMention = (text: string, cursor: number) => {
    const before = text.slice(0, cursor);
    const match = /@([\w.]*)$/.exec(before);
    if (match && match[1].length >= 0) {
      setMentionRange({
        start: cursor - match[0].length,
        end: cursor,
      });
    } else {
      setMentionRange(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    detectMention(e.target.value, e.target.selectionStart ?? 0);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setMentionRange(null);
      return;
    }
    const target = e.target as HTMLTextAreaElement;
    detectMention(target.value, target.selectionStart ?? 0);
  };

  const pickUser = (user: MentionUser) => {
    if (!mentionRange) return;
    const next =
      value.slice(0, mentionRange.start) +
      `@${user.username} ` +
      value.slice(mentionRange.end);
    onChange(next);
    setMentionRange(null);
    setOpen(false);
    // Đặt lại con trỏ sau username vừa chèn.
    requestAnimationFrame(() => {
      const el = innerRef.current;
      if (el) {
        const pos = mentionRange.start + user.username.length + 2;
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  };

  return (
    <VStack gap={0} className="relative w-full">
      <textarea
        {...rest}
        ref={setRefs}
        value={value}
        onChange={handleChange}
        onKeyUp={handleKeyUp}
        onBlur={() => {
          // Delay để click chọn user kịp chạy trước khi đóng.
          setTimeout(() => setOpen(false), 150);
        }}
      />
      {open && (
        <VStack
          gap={0}
          className="absolute left-0 right-0 top-full z-40 mt-1 max-h-56 overflow-y-auto rounded-xl border border-line bg-surface shadow-lg">
          {loading ? (
            <Text type="supporting" size="sm" className="px-3 py-2">
              {t("mention.searching")}
            </Text>
          ) : (
            suggestions.map((user) => (
              <button
                key={user.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pickUser(user);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-paper">
                <Avatar
                  src={user.avatar || "/images/user-avatar.png"}
                  name={user.fullName}
                  size={32}
                  tooltip={false}
                />
                <VStack gap={0} className="min-w-0">
                  <Text weight="medium" size="sm" maxLines={1}>
                    {user.fullName}
                  </Text>
                  <Text type="supporting" size="sm" maxLines={1}>
                    @{user.username}
                  </Text>
                </VStack>
              </button>
            ))
          )}
        </VStack>
      )}
    </VStack>
  );
};

export default MentionTextarea;
