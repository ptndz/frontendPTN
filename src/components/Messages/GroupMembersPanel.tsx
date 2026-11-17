import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { FiSearch, FiUserPlus } from "react-icons/fi";
import { useI18n } from "../../i18n/I18nProvider";
import { isBotUser } from "../../lib/botUsers";
import { searchUsersForMention } from "../../lib/social";
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
  onTransferAdmin: (userId: string) => Promise<void>;
  onLeave: () => Promise<void>;
}

interface DirectoryCandidate {
  id: string;
  username: string;
  fullName: string;
  avatar?: string | null;
  isBot?: boolean | null;
}

function normalizeCandidate(raw: any): DirectoryCandidate | null {
  if (!raw || (typeof raw.id !== "string" && typeof raw.id !== "number")) {
    return null;
  }
  const id = String(raw.id);
  if (!id) return null;
  return {
    id,
    username: typeof raw.username === "string" ? raw.username : "",
    fullName: typeof raw.fullName === "string" ? raw.fullName : "",
    avatar: typeof raw.avatar === "string" ? raw.avatar : null,
    isBot: typeof raw.isBot === "boolean" ? raw.isBot : null,
  };
}

function extractCandidateArray(payload: any): DirectoryCandidate[] {
  const arr = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.users)
      ? payload.users
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
  return arr
    .map(normalizeCandidate)
    .filter((u: DirectoryCandidate | null): u is DirectoryCandidate => u !== null);
}

/**
 * Panel thành viên nhóm chat (P2.1 + #18d): xem danh sách, đổi tên nhóm,
 * tìm kiếm toàn hệ thống (`GET /users/directory?q=...` + fallback bạn bè)
 * để thêm BẤT KỲ user hoặc AI bot (`@ai_muse002`, `@ai_muse003`, `@ai_antigravity`),
 * xóa thành viên (chỉ admin), tự rời nhóm.
 */
const GroupMembersPanel: React.FC<IProps> = ({
  conversation,
  currentUserId,
  friends,
  onClose,
  onRename,
  onAddMember,
  onRemoveMember,
  onTransferAdmin,
  onLeave,
}) => {
  const { t, locale } = useI18n();
  const [name, setName] = useState(conversation.name || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [directoryResults, setDirectoryResults] = useState<DirectoryCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isAdmin = conversation.adminId === currentUserId;

  const memberIds = useMemo(
    () => new Set((conversation.users || []).map((u: any) => String(u.id))),
    [conversation.users]
  );

  // Query GET /users/directory?q=... with fallback to /user/search & friends list (#18d)
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      const q = searchQuery.trim().replace(/^@/, "");
      try {
        const res = await axios.get("/users/directory", {
          params: { q, limit: 25 },
        });
        if (!cancelled) {
          setDirectoryResults(extractCandidateArray(res.data));
        }
      } catch {
        try {
          const fallback = await searchUsersForMention(q || "ai_");
          if (!cancelled) {
            setDirectoryResults(extractCandidateArray(fallback));
          }
        } catch {
          if (!cancelled) {
            setDirectoryResults([]);
          }
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isAdmin, searchQuery]);

  // Merge directory results with matching friends, deduplicate, and exclude existing members
  const addableCandidates = useMemo(() => {
    const q = searchQuery.trim().replace(/^@/, "").toLowerCase();
    const map = new Map<string, DirectoryCandidate>();
    for (const item of directoryResults) {
      if (!memberIds.has(item.id)) map.set(item.id, item);
    }
    for (const f of friends || []) {
      const norm = normalizeCandidate(f);
      if (!norm || memberIds.has(norm.id)) continue;
      if (
        !q ||
        norm.username.toLowerCase().includes(q) ||
        norm.fullName.toLowerCase().includes(q)
      ) {
        if (!map.has(norm.id)) map.set(norm.id, norm);
      }
    }
    const list = Array.from(map.values());
    // Show bots at top when query is empty or starts with ai
    list.sort((a, b) => {
      const aBot = isBotUser(a) ? 1 : 0;
      const bBot = isBotUser(b) ? 1 : 0;
      if (aBot !== bBot) return bBot - aBot;
      return (a.fullName || a.username).localeCompare(b.fullName || b.username);
    });
    return list;
  }, [directoryResults, friends, memberIds, searchQuery]);

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
    <Stack
      gap={4}
      className="w-full max-sm:absolute max-sm:inset-0 max-sm:z-10 max-sm:border-l-0 lg:w-80 shrink-0 border-l border-line bg-surface overflow-y-auto p-4">
      <HStack gap={2} vAlign="center" hAlign="between">
        <Text weight="semibold">
          {t("messenger.members.title", {
            count: conversation.users?.length || 0,
          })}
        </Text>
        <IconButton
          size="sm"
          variant="ghost"
          label={t("common.close")}
          icon={<Icon icon="close" />}
          onClick={onClose}
        />
      </HStack>

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
            {t("messenger.members.title", {
              count: conversation.users?.length || 0,
            })}
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
              isDisabled={
                busy || !name.trim() || name.trim() === conversation.name
              }
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
              <Stack gap={0} className="flex-1 min-w-0">
                <Text size="sm" maxLines={1}>
                  {u.fullName || u.username}
                  {u.id === conversation.adminId ? (
                    <span className="ml-1 text-xs bg-accent/10 text-accent rounded-full px-1.5 py-0.5">
                      admin
                    </span>
                  ) : null}
                  {u.id === currentUserId ? (
                    <Text size="sm" color="secondary">
                      {" "}
                      {t("messenger.members.you")}
                    </Text>
                  ) : null}
                </Text>
                {u.username ? (
                  <Text size="sm" color="secondary" className="text-xs">
                    @{u.username}
                  </Text>
                ) : null}
              </Stack>
              {isBotUser(u) ? (
                <Badge variant="purple" label="[BOT]" />
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
              {isAdmin &&
              u.id !== currentUserId &&
              u.id !== conversation.adminId ? (
                <Button
                  size="sm"
                  variant="secondary"
                  label={t("messenger.members.transferAdmin")}
                  isDisabled={busy}
                  onClick={() => run(() => onTransferAdmin(u.id))}>
                  {t("messenger.members.transferAdmin")}
                </Button>
              ) : null}
            </HStack>
          ))}
        </Stack>
      )}

      {isAdmin ? (
        <Stack gap={2} className="pt-2 border-t border-line">
          <Text size="sm" weight="semibold">
            {t("messenger.members.addMember")}
          </Text>
          <div className="relative">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted h-4 w-4 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === "en"
                  ? "Search user or @ai_muse002, @ai_antigravity..."
                  : "Tìm user hoặc @ai_muse002, @ai_antigravity..."
              }
              className="w-full bg-paper rounded-lg border border-line text-sm outline-none py-1.5 pl-8 pr-2.5"
            />
          </div>

          {searching ? (
            <Text size="sm" color="secondary" className="text-xs">
              {locale === "en" ? "Searching directory..." : "Đang tìm kiếm..."}
            </Text>
          ) : addableCandidates.length === 0 ? (
            <Text size="sm" color="secondary" className="text-xs">
              {locale === "en"
                ? "No matching users or bots found."
                : "Không tìm thấy người dùng hoặc bot phù hợp."}
            </Text>
          ) : (
            <Stack gap={2} className="max-h-52 overflow-y-auto pr-1">
              {addableCandidates.map((cand) => (
                <HStack
                  key={cand.id}
                  gap={2}
                  vAlign="center"
                  className="rounded-lg px-2 py-1.5 hover:bg-paper">
                  <Avatar
                    src={cand.avatar ?? undefined}
                    fallbackSrc="/images/user-avatar.png"
                    name={cand.fullName || cand.username}
                    size={32}
                    tooltip={false}
                  />
                  <Stack gap={0} className="flex-1 min-w-0">
                    <HStack gap={1} vAlign="center">
                      <Text size="sm" maxLines={1} className="font-medium">
                        {cand.fullName || cand.username}
                      </Text>
                      {isBotUser(cand) ? (
                        <Badge variant="purple" label="[BOT]" />
                      ) : null}
                    </HStack>
                    {cand.username ? (
                      <Text size="sm" color="secondary" className="text-xs">
                        @{cand.username}
                      </Text>
                    ) : null}
                  </Stack>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<FiUserPlus />}
                    label={t("messenger.members.add")}
                    isDisabled={busy}
                    onClick={() =>
                      run(async () => {
                        await onAddMember(cand.id);
                      })
                    }
                  />
                </HStack>
              ))}
            </Stack>
          )}
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
