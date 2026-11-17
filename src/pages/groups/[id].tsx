import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { toast } from "react-toastify";
import { useI18n } from "../../i18n/I18nProvider";
import { FaGlobe, FaLock } from "react-icons/fa";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";
import Navigation from "../../components/Share/Navigation";
import CreatePost from "../../components/Home/CreatePost";
import SinglePost from "../../components/Home/SinglePost";
import {
  approveGroupMember,
  fetchGroup,
  fetchGroupMembers,
  fetchGroupPosts,
  joinGroup,
  leaveGroup,
  removeGroupMember,
} from "../../lib/social";
import type { Group, GroupMember, PostWithExtras } from "../../types/social";
import dynamic from "next/dynamic";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { List, ListItem } from "@astryxdesign/core/List";
import { Skeleton } from "@astryxdesign/core/Skeleton";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

const DynamicWidgetMessage = dynamic(
  () => import("../../components/Messages/WidgetMessage"),
  { ssr: false }
);


interface IProps {
  userData: User;
}

/**
 * P1.4 — Trang chi tiết nhóm: header, thành viên, xin vào / rời nhóm,
 * duyệt / xóa thành viên (admin), feed riêng + composer đăng vào nhóm.
 */
const GroupDetailPage: React.FC<IProps> = ({ userData }) => {
  const { t } = useI18n();
  const { setUser, user } = useStoreUser();
  const router = useRouter();
  const groupId = typeof router.query.id === "string" ? router.query.id : "";

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<PostWithExtras[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deletePost, setDeletePost] = useState(false);
  const [feedRefresh, setFeedRefresh] = useState(0);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (userData) setUser(userData);
  }, [setUser, userData]);

  const loadGroup = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const [g, m, p] = await Promise.all([
        fetchGroup(groupId),
        fetchGroupMembers(groupId).catch(() => [] as GroupMember[]),
        fetchGroupPosts(groupId).catch(() => [] as PostWithExtras[]),
      ]);
      if (!g) {
        setNotFound(true);
      } else {
        setGroup(g);
        setMembers(m);
        setPosts(p);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  // Đăng bài xong trong composer của nhóm -> tải lại feed nhóm.
  useEffect(() => {
    if (feedRefresh === 0) return;
    fetchGroupPosts(groupId)
      .then(setPosts)
      .catch(() => undefined);
  }, [feedRefresh, groupId]);

  const isAdmin = group?.myRole === "admin";
  const isMember = group?.myRole === "member" || isAdmin;
  const pendingMembers = members.filter((m) => m.status === "pending");

  const handleJoinLeave = async () => {
    if (!group) return;
    setActionBusy(true);
    try {
      if (isMember) {
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
      loadGroup();
    } catch {
      toast.error(t("groups.actionFailed"));
    } finally {
      setActionBusy(false);
    }
  };

  const handleApprove = async (member: GroupMember) => {
    try {
      await approveGroupMember(groupId, member.user.id);
      toast.success(t("groups.approved", { name: member.user.fullName }));
      setMembers((prev) =>
        prev.map((m) =>
          m.user.id === member.user.id ? { ...m, status: "member" } : m
        )
      );
      loadGroup();
    } catch {
      toast.error(t("groups.approveFailed"));
    }
  };

  const handleRemove = async (member: GroupMember) => {
    if (!window.confirm(t("groups.removeConfirm", { name: member.user.fullName }))) return;
    try {
      await removeGroupMember(groupId, member.user.id);
      toast.success(t("groups.memberRemoved"));
      setMembers((prev) =>
        prev.filter((m) => m.user.id !== member.user.id)
      );
      loadGroup();
    } catch {
      toast.error(t("groups.removeFailed"));
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
          {loading ? (
            <VStack gap={3}>
              <Skeleton height={128} />
              <Skeleton height={96} index={1} />
            </VStack>
          ) : notFound || !group ? (
            <EmptyState
              title={t("groups.notFound")}
              description={t("groups.notFoundHint")}
              actions={
                <Link href="/groups" className="text-sm text-accent-bright">
                  {t("groups.backToList")}
                </Link>
              }
            />
          ) : (
            <>
              <Card>
                <VStack gap={3}>
                  <HStack gap={3} vAlign="start">
                    <Avatar name={group.name} size={64} shape="rounded" />
                    <VStack gap={0.5} className="min-w-0">
                      <Heading level={1}>{group.name}</Heading>
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
                        <Text as="p" className="whitespace-pre-wrap">
                          {group.description}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  <HStack justify="end" vAlign="center" gap={2} wrap="wrap">
                    {isAdmin ? (
                      <Text
                        type="supporting"
                        color="accent"
                        weight="medium">
                        {t("groups.youAreAdmin")}
                      </Text>
                    ) : null}
                    {group.myRole === "pending" ? (
                      <Text type="supporting">{t("groups.pendingApproval")}</Text>
                    ) : (
                      <Button
                        label={
                          actionBusy
                            ? t("groups.processing")
                            : isMember
                              ? t("groups.leaveGroup")
                              : group.privacy === "private"
                                ? t("groups.requestJoin")
                                : t("groups.joinGroupDetail")
                        }
                        variant={isMember ? "ghost" : "primary"}
                        size="sm"
                        isLoading={actionBusy}
                        onClick={handleJoinLeave}
                      />
                    )}
                  </HStack>
                </VStack>
              </Card>

              {/* Yêu cầu chờ duyệt — chỉ admin thấy */}
              {isAdmin && pendingMembers.length > 0 && (
                <VStack gap={2}>
                  <HStack gap={2} vAlign="center">
                    <Heading level={2}>{t("groups.joinRequests")}</Heading>
                    <Badge
                      label={String(pendingMembers.length)}
                      variant="warning"
                    />
                  </HStack>
                  <List hasDividers>
                    {pendingMembers.map((member) => (
                      <ListItem
                        key={member.user.id}
                        startContent={
                          <Avatar
                            src={
                              member.user.avatar ||
                              "/images/user-avatar.png"
                            }
                            name={member.user.fullName}
                            size={40}
                          />
                        }
                        label={
                          <Text weight="medium" maxLines={1}>
                            {member.user.fullName}
                          </Text>
                        }
                        description={`@${member.user.username}`}
                        endContent={
                          <HStack gap={2}>
                            <Button
                              label={t("groups.approve")}
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(member)}
                            />
                            <Button
                              label={t("groups.reject")}
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(member)}
                            />
                          </HStack>
                        }
                      />
                    ))}
                  </List>
                </VStack>
              )}

              {/* Thành viên */}
              <VStack gap={2}>
                <HStack gap={2} vAlign="center">
                  <Heading level={2}>{t("groups.members")}</Heading>
                  <Badge
                    label={String(members.length)}
                    variant="neutral"
                  />
                </HStack>
                {members.length === 0 ? (
                  <Text type="supporting">{t("groups.noMembers")}</Text>
                ) : (
                  <List hasDividers>
                    {members
                      .filter((m) => m.status !== "pending")
                      .map((member) => (
                        <ListItem
                          key={member.user.id}
                          startContent={
                            <Avatar
                              src={
                                member.user.avatar ||
                                "/images/user-avatar.png"
                              }
                              name={member.user.fullName}
                              size={40}
                            />
                          }
                          label={
                            <HStack gap={1} vAlign="center">
                              <Link href={`/${member.user.username}`}>
                                <Text weight="medium" maxLines={1}>
                                  {member.user.fullName}
                                </Text>
                              </Link>
                              {member.role === "admin" && (
                                <Text
                                  type="supporting"
                                  color="accent"
                                  weight="medium">
                                  {t("groups.admin")}
                                </Text>
                              )}
                            </HStack>
                          }
                          description={`@${member.user.username}`}
                          endContent={
                            isAdmin &&
                            member.user.id !== user.id &&
                            member.role !== "admin" ? (
                              <Button
                                label={t("groups.remove")}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemove(member)}
                              />
                            ) : undefined
                          }
                        />
                      ))}
                  </List>
                )}
              </VStack>

              {/* Composer + feed riêng của nhóm */}
              {isMember ? (
                <CreatePost
                  groupId={group.id}
                  groupName={group.name}
                  setNewPost={() => setFeedRefresh((r) => r + 1)}
                />
              ) : (
                <Card>
                  <Text type="supporting" justify="center" as="p">
                    {t("groups.joinToView")}
                  </Text>
                </Card>
              )}

              {isMember && posts.length === 0 ? (
                <EmptyState
                  title={t("groups.noPosts")}
                  description={t("groups.noPostsHint")}
                />
              ) : (
                <VStack gap={3}>
                  {posts.map((post) => (
                    <SinglePost
                      key={post.uuid}
                      post={post}
                      loading={false}
                      isBookmarkPage={false}
                      deletePost={deletePost}
                      setDeletePost={setDeletePost}
                      bookmarkedPostsId={[]}
                    />
                  ))}
                </VStack>
              )}
            </>
          )}
          <DynamicWidgetMessage />
        </VStack>
      </HStack>
    </>
  );
};

export default GroupDetailPage;

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
