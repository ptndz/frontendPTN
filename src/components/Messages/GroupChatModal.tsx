import { useEffect, useState } from "react";
import { User } from "../../gql/graphql";
import { useI18n } from "../../i18n/I18nProvider";
import { searchUsersForMention } from "../../lib/social";
import type { MentionUser } from "../../types/social";
import {
  isBotUser,
  missingBotUsernames,
  pickKnownBots,
} from "../../lib/botUsers";
import { Dialog } from "@astryxdesign/core/Dialog";
import { DialogHeader } from "@astryxdesign/core/Dialog";
import { TextInput } from "@astryxdesign/core/TextInput";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";

interface IProps {
  friends: User[];
  onClose: () => void;
  onCreate: (name: string, memberIds: string[]) => Promise<void>;
}

/**
 * Tạo nhóm chat (P2.1): chọn ít nhất 2 bạn + đặt tên nhóm (không bắt
 * buộc — để trống thì server đặt tên theo thành viên).
 *
 * Bot account (thiết kế mục 4.2, item 10): thêm được 3 trợ lý AI
 * (ai_nyx / ai_antigravity / ai_chatgpt) vào nhóm, ngoài bạn bè.
 * Bạn bè lấy từ `GET /friends/my` (prop `friends`) — bot không phải bạn
 * nên không nằm trong đó; modal tự resolve bot bằng lookup user đã có
 * `GET /user/search?keyword=ai_` (searchUsersForMention) rồi lọc đúng
 * 3 username — KHÔNG cần endpoint backend mới. Bot resolve được mới
 * chọn được (có id thật để `POST /messenger/groups` nhận); bot chưa
 * được seed trên backend thì hiện hàng mờ + ghi chú, không chọn được.
 */
const GroupChatModal: React.FC<IProps> = ({ friends, onClose, onCreate }) => {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [bots, setBots] = useState<MentionUser[]>([]);
  const [botsReady, setBotsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    searchUsersForMention("ai_")
      .then((users) => {
        if (!cancelled) setBots(pickKnownBots(users));
      })
      .catch(() => {
        // Lookup lỗi -> coi như chưa resolve được bot nào; các hàng bot
        // bên dưới vẫn hiện ở dạng chưa có tài khoản.
        if (!cancelled) setBots([]);
      })
      .finally(() => {
        if (!cancelled) setBotsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const matchesSearch = (fullName?: string | null, username?: string | null) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (fullName || "").toLowerCase().includes(q) ||
      (username || "").toLowerCase().includes(q)
    );
  };

  const filtered = friends.filter((f) => matchesSearch(f.fullName, f.username));
  // Bot đã là bạn (hiếm) thì chỉ hiện 1 lần, ở mục bot.
  const botIds = new Set(bots.map((b) => b.id));
  const filteredFriends = filtered.filter((f) => !botIds.has(f.id));
  const filteredBots = bots.filter((b) => matchesSearch(b.fullName, b.username));
  const missingBots = botsReady
    ? missingBotUsernames(bots).filter((username) => matchesSearch(username, username))
    : [];

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (selected.size < 2) {
      setError(t("messenger.groupChat.needTwo"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onCreate(name.trim(), Array.from(selected));
      onClose();
    } catch {
      setError(t("messenger.groupChat.createFailed"));
    } finally {
      setBusy(false);
    }
  };

  const renderRow = (
    id: string,
    fullName: string,
    username: string,
    avatar: string | null | undefined,
    bot: boolean,
    disabled?: boolean
  ) => (
    <HStack
      key={id}
      gap={3}
      vAlign="center"
      className={
        disabled
          ? "px-2 py-2 rounded-lg opacity-50"
          : "px-2 py-2 rounded-lg hover:bg-paper cursor-pointer"
      }
      onClick={disabled ? undefined : () => toggle(id)}>
      <CheckboxInput
        label={fullName || username}
        isLabelHidden
        value={selected.has(id)}
        onChange={disabled ? undefined : () => toggle(id)}
        isDisabled={disabled}
      />
      <Avatar
        src={avatar ?? undefined}
        fallbackSrc="/images/user-avatar.png"
        name={fullName || ""}
        size={36}
        tooltip={false}
      />
      <Text weight="semibold" size="sm" maxLines={1} className="flex-1 min-w-0">
        {fullName || username}
      </Text>
      {bot ? <Badge variant="purple" label="[BOT AI]" /> : null}
      {disabled ? (
        <Text size="sm" color="secondary" maxLines={1}>
          {t("messenger.groupChat.botsUnavailable")}
        </Text>
      ) : null}
    </HStack>
  );

  return (
    <Dialog
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      purpose="form"
      width={448}>
      <DialogHeader
        title={t("messenger.groupChat.title")}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      />
      <Stack gap={2}>
        <TextInput
          label={t("messenger.groupChat.namePlaceholder")}
          isLabelHidden
          value={name}
          onChange={(value) => setName(value)}
          placeholder={t("messenger.groupChat.namePlaceholder")}
        />
        <TextInput
          label={t("messenger.groupChat.searchPlaceholder")}
          isLabelHidden
          value={search}
          onChange={(value) => setSearch(value)}
          placeholder={t("messenger.groupChat.searchPlaceholder")}
        />
        <Stack gap={1} className="flex-1 overflow-y-auto min-h-0">
          {filteredFriends.map((f) =>
            renderRow(f.id, f.fullName || f.username, f.username, f.avatar, isBotUser(f))
          )}
          {filteredFriends.length === 0 && filteredBots.length === 0 && missingBots.length === 0 ? (
            <Text size="sm" color="secondary" className="px-2 py-4">
              {t("messenger.groupChat.noFriends")}
            </Text>
          ) : null}
          <Text weight="semibold" size="sm" className="px-2 pt-2">
            {t("messenger.groupChat.botsTitle")}
          </Text>
          {!botsReady ? (
            <Text size="sm" color="secondary" className="px-2 py-2">
              {t("common.loading")}
            </Text>
          ) : null}
          {filteredBots.map((b) =>
            renderRow(b.id, b.fullName || b.username, b.username, b.avatar, true)
          )}
          {missingBots.map((username) =>
            renderRow(`bot-missing-${username}`, username, username, null, true, true)
          )}
        </Stack>
        {error ? (
          <Text size="sm" className="text-danger">
            {error}
          </Text>
        ) : null}
        <Text size="sm" color="secondary">
          {t("messenger.groupChat.selected", { count: selected.size })}
        </Text>
        <Button
          variant="primary"
          label={busy ? t("messenger.groupChat.creating") : t("messenger.groupChat.create")}
          isDisabled={busy || selected.size < 2}
          isLoading={busy}
          onClick={handleCreate}
          className="w-full"
        />
      </Stack>
    </Dialog>
  );
};

export default GroupChatModal;
