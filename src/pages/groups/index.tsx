import React, { useEffect, useState } from "react";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { toast } from "react-toastify";
import { useI18n } from "../../i18n/I18nProvider";
import { FaGlobe, FaLock, FaUsers } from "react-icons/fa";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";
import Navigation from "../../components/Share/Navigation";
import {
  createGroup,
  fetchGroups,
  joinGroup,
  leaveGroup,
} from "../../lib/social";
import type { Group } from "../../types/social";
import dynamic from "next/dynamic";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { List, ListItem } from "@astryxdesign/core/List";
import { Selector } from "@astryxdesign/core/Selector";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

const DynamicWidgetMessage = dynamic(
  () => import("../../components/Messages/WidgetMessage"),
  { ssr: false }
);

interface IProps {
  userData: User;
}

/**
 * P1.4 — Trang nhóm: tìm kiếm + danh sách + tạo nhóm.
 * Sidebar "Popular Groups" (xem snippet trong báo cáo) trỏ về đây.
 */
const GroupsPage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const { setUser } = useStoreUser();
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const load = async (q: string, p: number, append = false) => {
    setLoading(true);
    try {
      const res = await fetchGroups({ q, page: p, limit: 20 });
      setGroups((prev) => (append ? [...prev, ...res.groups] : res.groups));
      setTotal(res.total);
      setPage(p);
    } catch {
      toast.error(t("groups.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => load(search.trim(), 1), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error(t("groups.enterName"));
      return;
    }
    setCreating(true);
    try {
      const group = await createGroup({
        name: name.trim(),
        description: description.trim(),
        privacy,
      });
      toast.success(t("groups.created"));
      setShowCreate(false);
      setName("");
      setDescription("");
      if (group) {
        setGroups((prev) => [group, ...prev]);
      } else {
        load("", 1);
      }
    } catch {
      toast.error(t("groups.createFailed"));
    } finally {
      setCreating(false);
    }
  };

  const handleJoinLeave = async (group: Group) => {
    try {
      if (group.myRole === "member" || group.myRole === "admin") {
        await leaveGroup(group.id);
        toast.success(t("groups.leftGroup"));
      } else {
        await joinGroup(group.id);
        toast.success(
          group.privacy === "private"
            ? t("groups.joinRequestSent")
            : t("groups.joined")
        );
      }
      load(search.trim(), 1);
    } catch {
      toast.error(t("groups.actionFailed"));
    }
  };

  return (
    <>
      <Navigation />
      <HStack justify="center" width="100%" className="bg-paper">
        <VStack
          gap={3}
          width="100%"
          maxWidth={768}
          paddingInline={2}
          paddingBlockStart={2}
          paddingBlockEnd={8}>
          <Card>
            <VStack gap={3}>
              <HStack justify="between" vAlign="center" gap={2}>
                <HStack gap={2} vAlign="center">
                  <FaUsers className="text-accent-bright" />
                  <Heading level={1}>{t("groups.title")}</Heading>
                </HStack>
                <Button
                  label={showCreate ? t("common.close") : `+ ${t("groups.createGroup")}`}
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreate(!showCreate)}
                />
              </HStack>
              {showCreate && (
                <VStack gap={2}>
                  <TextInput
                    label={t("groups.nameLabel")}
                    value={name}
                    onChange={(v) => setName(v)}
                    placeholder={t("groups.nameLabel")}
                  />
                  <TextArea
                    label={t("groups.descriptionLabel")}
                    value={description}
                    onChange={(v) => setDescription(v)}
                    placeholder={t("groups.descriptionPlaceholder")}
                    rows={3}
                    isOptional
                  />
                  <Selector
                    label={t("groups.privacyLabel")}
                    value={privacy}
                    onChange={(v) => setPrivacy(v)}
                    options={[
                      {
                        value: "public",
                        label: t("groups.privacyPublic"),
                      },
                      {
                        value: "private",
                        label: t("groups.privacyPrivate"),
                      },
                    ]}
                  />
                  <Button
                    label={creating ? t("groups.creating") : t("groups.createGroup")}
                    variant="primary"
                    width="100%"
                    isLoading={creating}
                    onClick={handleCreate}
                  />
                </VStack>
              )}
              <TextInput
                label={t("groups.searchLabel")}
                type="search"
                value={search}
                onChange={(v) => setSearch(v)}
                placeholder={t("groups.searchPlaceholder")}
                isLabelHidden
                hasClear
              />
            </VStack>
          </Card>

          {loading && groups.length === 0 ? (
            <VStack gap={3}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={96} index={i} />
              ))}
            </VStack>
          ) : groups.length === 0 ? (
            <EmptyState
              title={
                search.trim()
                  ? t("groups.noGroupsFound", { q: search.trim() })
                  : t("groups.noGroups")
              }
              description={
                search.trim() ? undefined : t("groups.createFirst")
              }
            />
          ) : (
            <List hasDividers>
              {groups.map((group) => (
                <ListItem
                  key={group.id}
                  startContent={
                    <Avatar
                      name={group.name}
                      size={48}
                      shape="rounded"
                    />
                  }
                  label={
                    <Link href={`/groups/${group.id}`}>
                      <Text weight="semibold" maxLines={1}>
                        {group.name}
                      </Text>
                    </Link>
                  }
                  description={
                    <VStack gap={0.5}>
                      <HStack gap={1} vAlign="center">
                        {group.privacy === "private" ? (
                          <FaLock className="text-muted" />
                        ) : (
                          <FaGlobe className="text-muted" />
                        )}
                        <Text type="supporting">
                          {group.privacy === "private"
                            ? t("groups.privateGroup")
                            : t("groups.publicGroup")}{" "}
                          · {t("groups.membersCount", { count: group.memberCount })}
                        </Text>
                      </HStack>
                      {group.description && (
                        <Text type="supporting" maxLines={1}>
                          {group.description}
                        </Text>
                      )}
                    </VStack>
                  }
                  endContent={
                    group.myRole === "admin" ? (
                      <Text type="supporting" color="accent" weight="medium">
                        {t("groups.youAreAdmin")}
                      </Text>
                    ) : group.myRole === "member" ? (
                      <Button
                        label={t("groups.leaveGroup")}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleJoinLeave(group)}
                      />
                    ) : group.myRole === "pending" ? (
                      <Text type="supporting">{t("groups.pendingApproval")}</Text>
                    ) : (
                      <Button
                        label={
                          group.privacy === "private"
                            ? t("groups.requestJoin")
                            : t("groups.joinGroup")
                        }
                        variant="primary"
                        size="sm"
                        onClick={() => handleJoinLeave(group)}
                      />
                    )
                  }
                />
              ))}
            </List>
          )}

          {total > groups.length && (
            <Button
              label={loading ? t("common.loading") : t("feed.loadMore")}
              variant="secondary"
              width="100%"
              isLoading={loading}
              onClick={() => load(search.trim(), page + 1, true)}
            />
          )}
          <DynamicWidgetMessage />
        </VStack>
      </HStack>
    </>
  );
};

export default GroupsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const user = await getAuthenticatedUser(context);
    if (user) {
      return { props: { userData: user } };
    }
  } catch (error) {}

  return {
    redirect: { destination: "/login", permanent: false },
  };
};
