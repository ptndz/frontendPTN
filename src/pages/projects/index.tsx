import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import axios from "axios";
import { toast } from "react-toastify";
import { useI18n } from "../../i18n/I18nProvider";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";
import Navigation from "../../components/Share/Navigation";
import GroupChatModal from "../../components/Messages/GroupChatModal";
import {
  createProjectGroup,
  fetchGroupConversations,
  fetchProjectTasks,
  groupTasksByStatus,
  projectGroupDisplayName,
  renameProjectGroup,
  type ProjectGroupConversation,
  type ProjectTaskStatus,
} from "../../lib/projectTasks";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { List, ListItem } from "@astryxdesign/core/List";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";

interface IProps {
  userData: User;
}

type Counts = Record<ProjectTaskStatus, number>;

interface ProjectRow {
  conv: ProjectGroupConversation;
  counts: Counts;
}

/**
 * Trang danh sách dự án (nhóm chat có board Trello): mỗi nhóm chat là
 * 1 dự án, board ở /projects/:id/tasks. Số task từng nhóm đếm song
 * song (Promise.all, lỗi từng nhóm -> 0) để không chặn cả trang vì
 * 1 nhóm lỗi; chưa có endpoint tổng hợp số task.
 */
const ProjectsPage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const { setUser } = useStoreUser();
  const router = useRouter();
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Tạo dự án = tạo nhóm chat mới (tái dùng GroupChatModal của Messenger).
  const [showCreate, setShowCreate] = useState(false);
  const [friends, setFriends] = useState<User[] | undefined>(undefined);
  const [friendsLoading, setFriendsLoading] = useState(false);
  // Đổi tên inline theo từng dòng (chỉ admin nhóm mới thấy nút).
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const groups = await fetchGroupConversations();
      const counted = await Promise.all(
        groups.map(async (conv): Promise<ProjectRow> => {
          const empty: Counts = { todo: 0, doing: 0, done: 0 };
          try {
            const grouped = groupTasksByStatus(
              await fetchProjectTasks(conv.id)
            );
            return {
              conv,
              counts: {
                todo: grouped.todo.length,
                doing: grouped.doing.length,
                done: grouped.done.length,
              },
            };
          } catch {
            return { conv, counts: empty };
          }
        })
      );
      setRows(counted);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = async () => {
    if (friends === undefined && !friendsLoading) {
      setFriendsLoading(true);
      try {
        const res = await axios.get("/friends/my");
        if (res.data?.success) setFriends(res.data.friends ?? []);
        else setFriends([]);
      } catch {
        setFriends([]);
      } finally {
        setFriendsLoading(false);
      }
    }
    setShowCreate(true);
  };

  const handleCreateProject = async (name: string, memberIds: string[]) => {
    const conv = await createProjectGroup(name, memberIds);
    await load();
    await router.push(`/projects/${conv.id}/tasks`);
  };

  const handleRenameSave = async (convId: string) => {
    const name = renameDraft.trim();
    if (!name || renaming) return;
    setRenaming(true);
    try {
      const renamed = await renameProjectGroup(convId, name);
      setRows((prev) =>
        prev.map((r) => (r.conv.id === convId ? { ...r, conv: renamed } : r))
      );
      setRenamingId(null);
    } catch (e: any) {
      // Backend trả 403 khi không phải admin (đã giấu nút, chỉ phòng hờ).
      const status = e?.response?.status;
      toast.error(
        status === 403
          ? t("projects.renameForbidden")
          : t("projects.renameFailed")
      );
    } finally {
      setRenaming(false);
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
          <HStack gap={2} vAlign="center">
            <Heading level={1} className="flex-1 min-w-0">
              {t("projects.title")}
            </Heading>
            <Button
              size="sm"
              variant="primary"
              label={t("projects.createProject")}
              isLoading={friendsLoading}
              onClick={openCreate}
            />
          </HStack>
          {loading && rows.length === 0 ? (
            <VStack gap={3}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={96} index={i} />
              ))}
            </VStack>
          ) : loadError ? (
            <VStack gap={2}>
              <Text size="sm" className="text-danger">
                {t("projects.loadFailed")}
              </Text>
              <Button
                size="sm"
                variant="primary"
                label={t("common.retry")}
                onClick={load}
              />
            </VStack>
          ) : rows.length === 0 ? (
            <EmptyState
              title={t("projects.empty")}
              description={t("projects.emptyHint")}
            />
          ) : (
            <List hasDividers>
              {rows.map(({ conv, counts }) => {
                const name =
                  projectGroupDisplayName(conv) || t("projects.unnamed");
                const isAdmin = conv.adminId === userData.id;
                const isRenaming = renamingId === conv.id;
                return (
                  <ListItem
                    key={conv.id}
                    startContent={
                      <Avatar
                        name={name}
                        size={48}
                        shape="rounded"
                      />
                    }
                    label={
                      isRenaming ? (
                        <VStack gap={1}>
                          <TextInput
                            label={t("projects.rename")}
                            isLabelHidden
                            value={renameDraft}
                            onChange={(value) => setRenameDraft(value)}
                            placeholder={name}
                          />
                          <HStack gap={2} vAlign="center">
                            <Button
                              size="sm"
                              variant="primary"
                              label={t("messenger.save")}
                              isDisabled={renaming || !renameDraft.trim()}
                              isLoading={renaming}
                              onClick={() => handleRenameSave(conv.id)}
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              label={t("common.cancel")}
                              onClick={() => setRenamingId(null)}
                            />
                          </HStack>
                        </VStack>
                      ) : (
                        <Link href={`/projects/${conv.id}/tasks`}>
                          <Text weight="semibold" maxLines={1}>
                            {name}
                          </Text>
                        </Link>
                      )
                    }
                    description={
                      <VStack gap={0.5}>
                        <Text type="supporting">
                          {t("projects.membersCount", {
                            count: conv.users.length,
                          })}
                          {" · "}
                          {t("projects.tasksSummary", {
                            todo: counts.todo,
                            doing: counts.doing,
                            done: counts.done,
                          })}
                        </Text>
                      </VStack>
                    }
                    endContent={
                      <HStack gap={2} vAlign="center">
                        {isAdmin && !isRenaming ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            label={t("projects.rename")}
                            onClick={() => {
                              setRenamingId(conv.id);
                              setRenameDraft(conv.name ?? "");
                            }}
                          />
                        ) : null}
                        <Link href={`/projects/${conv.id}/tasks`}>
                          <Button
                            size="sm"
                            variant="secondary"
                            label={t("projects.openBoard")}
                          />
                        </Link>
                      </HStack>
                    }
                  />
                );
              })}
            </List>
          )}
        </VStack>
      </HStack>
      {showCreate && friends !== undefined ? (
        <GroupChatModal
          friends={friends}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreateProject}
        />
      ) : null}
    </>
  );
};

export default ProjectsPage;

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
