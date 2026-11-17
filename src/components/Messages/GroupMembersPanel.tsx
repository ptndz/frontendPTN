import { useState } from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { isBotUser } from "../../lib/botUsers";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Icon } from "@astryxdesign/core/Icon";
import { Avatar } from "@astryxdesign/core/Avatar";
import { AvatarGroup } from "@astryxdesign/core/AvatarGroup";
import { Badge } from "@astryxdesign/core/Badge";
import { TextInput } from "@astryxdesign/core/TextInput";

interface IProps {
  conversation: any;
  currentUserId: string;
  friends: any[];
  onClose: () => void;
  onRename: (name: string) => Promise<void>;
  onAddMember: (userId: string) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onLeave: () => Promise<void>;
}

/**
 * Panel thành viên nhóm chat (P2.1): xem danh sách, đổi tên nhóm,
 * thêm/xóa thành viên (chỉ admin), tự rời nhóm (ai cũng được).
 */
const GroupMembersPanel: React.FC<IProps> = ({
  conversation,
  currentUserId,
  friends,
  onClose,
  onRename,
  onAddMember,
  onRemoveMember,
  onLeave,
}) => {
  const { t } = useI18n();
  const [name, setName] = useState(conversation.name || "");
  const [addId, setAddId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = conversation.adminId === currentUserId;
  const memberIds = new Set((conversation.users || []).map((u: any) => u.id));
  const addable = friends.filter((f) => !memberIds.has(f.id));

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch {
      setError(t("messenger.members.actionFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack gap={4} className="w-full max-sm:absolute max-sm:inset-0 max-sm:z-10 max-sm:border-l-0 lg:w-72 shrink-0 border-l border-line bg-surface overflow-y-auto p-4">
      <HStack gap={2} vAlign="center" hAlign="between">
        <Text weight="semibold">
          {t("messenger.members.title", { count: conversation.users?.length || 0 })}
        </Text>
        <IconButton
          size="sm"
          variant="ghost"
          label={t("common.close")}
          icon={<Icon icon="close" />}
          onClick={onClose}
        />
      </HStack>
      {/* Avatar + tên nhóm ở đầu panel (tên đã hiện ở đây nên bản
          không-admin dưới kia không lặp lại nữa). */}
      <HStack gap={3} vAlign="center">
        <AvatarGroup size={40} className="shrink-0">
          {(conversation.users || []).slice(0, 3).map((u: any) => (
            <Avatar
              key={u.id}
              src={u.avatar}
              fallbackSrc="/images/user-avatar.png"
              name={u.fullName || ""}
              tooltip={false}
            />
          ))}
        </AvatarGroup>
        <Stack gap={0} className="flex-1 min-w-0">
          <Text weight="semibold" maxLines={1}>
            {conversation.name || t("messenger.members.groupFallback")}
          </Text>
          <Text size="sm" color="secondary">
            {t("messenger.members.title", { count: conversation.users?.length || 0 })}
          </Text>
        </Stack>
      </HStack>
      {isAdmin ? (
        <Stack gap={1}>
          <Text size="sm" color="secondary">
            {t("messenger.members.groupName")}
          </Text>
          <HStack gap={2} vAlign="center">
            <TextInput
              label={t("messenger.members.groupName")}
              isLabelHidden
              value={name}
              onChange={(value) => setName(value)}
              containerClassName="flex-1 min-w-0"
            />
            <Button
              size="sm"
              variant="ghost"
              label={t("messenger.members.save")}
              isDisabled={busy || !name.trim() || name.trim() === conversation.name}
              onClick={() => run(() => onRename(name.trim()))}
            />
          </HStack>
        </Stack>
      ) : null}
      {(conversation.users || []).length === 0 ? (
        <Text size="sm" color="secondary">
          {t("messenger.members.noMembers")}
        </Text>
      ) : (
        <Stack gap={2}>
          {(conversation.users || []).map((u: any) => (
            <HStack key={u.id} gap={2} vAlign="center">
              <Avatar
                src={u.avatar}
                fallbackSrc="/images/user-avatar.png"
                name={u.fullName || ""}
                size={32}
                tooltip={false}
              />
              <Text size="sm" maxLines={1} className="flex-1 min-w-0">
                {u.fullName || u.username}
                {u.id === conversation.adminId ? (
                  <span className="ml-1 text-xs bg-accent/10 text-accent rounded-full px-1.5 py-0.5">admin</span>
                ) : null}
                {u.id === currentUserId ? (
                  <Text size="sm" color="secondary">
                    {" "}
                    {t("messenger.members.you")}
                  </Text>
                ) : null}
              </Text>
              {isBotUser(u) ? (
                <Badge variant="purple" label="[BOT AI]" />
              ) : null}
              {isAdmin && u.id !== currentUserId ? (
                <IconButton
                  size="sm"
                  variant="ghost"
                  label={t("messenger.members.removeFromGroup")}
                  icon={<Icon icon="close" />}
                  isDisabled={busy}
                  onClick={() => run(() => onRemoveMember(u.id))}
                />
              ) : null}
            </HStack>
          ))}
        </Stack>
      )}
      {isAdmin && addable.length > 0 ? (
        <Stack gap={1}>
          <Text size="sm" color="secondary">
            {t("messenger.members.addMember")}
          </Text>
          <HStack gap={2} vAlign="center">
            <select
              value={addId}
              onChange={(e) => setAddId(e.target.value)}
              className="flex-1 min-w-0 bg-paper rounded-lg border border-line text-sm outline-none py-1.5 px-2">
              <option value="">{t("messenger.members.chooseFriend")}</option>
              {addable.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.fullName || f.username}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="ghost"
              label={t("messenger.members.add")}
              isDisabled={busy || !addId}
              onClick={() =>
                run(async () => {
                  await onAddMember(addId);
                  setAddId("");
                })
              }
            />
          </HStack>
        </Stack>
      ) : null}
      {error ? (
        <Text size="sm" className="text-danger">
          {error}
        </Text>
      ) : null}
      <Button
        variant="destructive"
        label={t("messenger.members.leaveGroup")}
        isDisabled={busy}
        onClick={() => run(onLeave)}
        className="w-full"
      />
      {isAdmin ? (
        <Text size="sm" color="secondary">
          {t("messenger.members.leaveNote")}
        </Text>
      ) : null}
    </Stack>
  );
};

export default GroupMembersPanel;
