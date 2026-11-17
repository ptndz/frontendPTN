import React, { Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import ProfileModal from "./ProfileModal";
import AboutModal from "./AboutModal";
import axios from "axios";
import SinglePost from "../Home/SinglePost";
import VerifiedBadge from "../Share/VerifiedBadge";
import {
  blockUser,
  getBlockStatus,
  requestVerification,
  unblockUser,
} from "../../lib/p3";
import {
  fetchFollowStatus,
  FollowStatus,
} from "../../lib/social";
import FollowButton from "../Share/FollowButton";
import { useI18n } from "../../i18n/I18nProvider";
import FollowListModal from "../Share/FollowListModal";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import CreatePost from "../Home/CreatePost";
import { useStoreUser } from "../../store/user";
import { User, ProfileUser } from "../../gql/graphql";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import moment from "moment";
import { fetchUserPostsPage } from "../../graphql/post";
import { FriendRequestStatus } from "../../types/friends";
import Head from "next/head";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Link } from "@astryxdesign/core/Link";
import { List, ListItem } from "@astryxdesign/core/List";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { Stack, StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";

interface IProps {
  userData: User;
  setUpdateUserData: (updateUserData: boolean) => void;
  profileData: ProfileUser;
}
interface IFriendRequestStatus extends FriendRequestStatus {
  id: number;
}
// Số bài mỗi trang khi tải bài của user (dùng chung cho label số bài).
const POSTS_PAGE_SIZE = 10;
const UserProfile: React.FC<IProps> = ({
  userData,
  setUpdateUserData,
  profileData,
}) => {
  const router = useRouter();
  // useI18n() đăng ký render lại khi đổi ngôn ngữ — cần cho "Joined {fromNow()}"
  // bên dưới vì fromNow() đọc locale moment toàn cục, không phải t().
  const { t } = useI18n();

  const [deletePost, setDeletePost] = useState(false);
  const { user } = useStoreUser();
  const [bookmarkedPostsId, setBookmarkedPostsId] = useState<string[]>();
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [statusFriends, setStatusFriends] = useState<IFriendRequestStatus>();
  const [newPost, setNewPost] = useState(false);
  // P3.2/P3.4 — chặn user + xin xác minh.
  const [blocked, setBlocked] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyReason, setVerifyReason] = useState("");
  const [verifySent, setVerifySent] = useState(false);
  // P4.1 — theo dõi: trạng thái + số lượng, modal danh sách.
  const [followStatus, setFollowStatus] = useState<FollowStatus | null>(null);
  const [followListKind, setFollowListKind] = useState<
    "followers" | "following" | null
  >(null);
  // Tab nội dung: Bài viết / Giới thiệu (Bạn bè là link sang /friends).
  const [tab, setTab] = useState<"posts" | "about">("posts");

  useEffect(() => {
    const fetchBlock = async () => {
      try {
        setBlocked(await getBlockStatus(userData.id));
      } catch {
        // Không chặn được thì mặc định chưa chặn.
      }
    };
    if (userData?.id && userData.id !== user.id) {
      fetchBlock();
    }
  }, [userData, user]);

  useEffect(() => {
    const fetchFollow = async () => {
      try {
        setFollowStatus(await fetchFollowStatus(userData.id));
      } catch {
        // Không lấy được thì ẩn số follow, nút follow vẫn dùng mặc định.
      }
    };
    if (userData?.id) {
      fetchFollow();
    }
  }, [userData]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/bookmark/all");
      if (res.data.status === 200) {
        setBookmarkedPostsId(res.data.bookmarkedPostsId || []);
      }
    };
    fetchData();
  }, []);

  const getPost = async (pageParam: number) => {
    const username = userData.username;
    // P1 — query có poll/audience, tự fallback về query cũ nếu backend
    // chưa có field mới (xem fetchUserPostsPage trong src/graphql/post.ts).
    return fetchUserPostsPage(username, pageParam, POSTS_PAGE_SIZE);
  };
  const queryClient = useQueryClient();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["userPosts"],
    queryFn: ({ pageParam }) => getPost(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages) => {
      const page = lastPage?.page ? lastPage.page + 1 : 1;
      return page;
    },
  });

  const loadMoreRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (newPost) {
      fetchNextPage();
    }
  }, [fetchNextPage, newPost]);

  useEffect(() => {
    if (!hasNextPage) {
      return;
    }
    const observer = new IntersectionObserver((entries) =>
      entries.forEach((entry) => entry.isIntersecting && fetchNextPage())
    );
    const el = loadMoreRef && loadMoreRef.current;
    if (!el) {
      return;
    }
    observer.observe(el);
  }, [hasNextPage, router, fetchNextPage]);

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await axios.get(`/friends/status/${userData.id}`);

      if (res.data.status) {
        setStatusFriends({
          id: res.data.id,
          status: res.data.status,
        });
      }
    };
    if (userData?.id !== user.id) {
      fetchFriends();
    }
  }, [userData, user]);
  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["userPosts"] });
    return () => {
      queryClient.removeQueries({ queryKey: ["userPosts"] });
    };
  }, [router.pathname, queryClient]);
  const renderFriendsButton = () => {
    const componentStatus = [
      {
        status: "not-sent",
        component: (
          <Button
            label={t("profile.addFriends")}
            variant="primary"
            onClick={async () => {
              const res = await axios.post(`/friends/send/${userData.id}`);

              if (res.data.status) {
                setStatusFriends({
                  id: res.data.id,
                  status: res.data.status,
                });
              }
            }}
          />
        ),
      },
      {
        status: "pending",
        component: (
          <Button
            label={t("profile.cancelRequest")}
            variant="secondary"
            onClick={async () => {
              const res = await axios.put(
                `/friends/response/${statusFriends?.id}`,
                {
                  status: "declined",
                }
              );
              if (res.data.status) {
                setStatusFriends({
                  id: res.data.id,
                  status: res.data.status,
                });
              }
            }}
          />
        ),
      },
      {
        status: "accepted",
        component: (
          <HStack gap={2} hAlign="center">
            <Button label={t("profile.messages")} href="/messenger" variant="primary" />
            <Button label={t("profile.friends")} variant="secondary" />
          </HStack>
        ),
      },
      {
        status: "declined",
        component: (
          <Button
            label={t("profile.addFriends")}
            variant="primary"
            onClick={async () => {
              const res = await axios.put(
                `/friends/response/${statusFriends?.id}`,
                {
                  status: "pending",
                }
              );
              if (res.data.status) {
                setStatusFriends({
                  id: res.data.id,
                  status: res.data.status,
                });
              }
            }}
          />
        ),
      },
      {
        status: "waiting-for-current-user-response",
        component: (
          <Button
            label={t("profile.acceptRequests")}
            variant="primary"
            onClick={async () => {
              const res = await axios.put(
                `/friends/response/${statusFriends?.id}`,
                {
                  status: "accepted",
                }
              );
              if (res.data.status) {
                setStatusFriends({
                  id: res.data.id,
                  status: res.data.status,
                });
              }
            }}
          />
        ),
      },
    ];

    return (
      componentStatus.find((item) => item.status === statusFriends?.status)
        ?.component || null
    );
  };

  // Ảnh bìa: seed user có coverImage trùng y hệt URL avatar nên ảnh bìa
  // cũ render thành "mặt khổng lồ" và avatar chìm hẳn vào bìa. Chỉ coi
  // là bìa thật khi có URL khác avatar; còn lại hiện placeholder phẳng
  // (không gradient trang trí, theo Mono).
  const hasRealCover =
    !!userData?.coverImage && userData.coverImage !== userData.avatar;
  // Số bài viết lấy từ dữ liệu bài đã tải (backend không trả total).
  // Chỉ thêm "+" khi trang cuối tải đủ 1 trang (có thể còn trang sau);
  // trang cuối thiếu nghĩa là đã hết bài.
  const postCount =
    data?.pages.reduce((n, p) => n + (p?.posts?.length ?? 0), 0) ?? 0;
  const lastPageSize =
    data?.pages[data.pages.length - 1]?.posts?.length ?? 0;
  const postCountLabel =
    lastPageSize === POSTS_PAGE_SIZE ? `${postCount}+` : `${postCount}`;

  const renderAboutCard = (width: number | string) => (
    <Card padding={5} width={width}>
      <Stack gap={4}>
        <Heading level={2}>{t("profile.about")}</Heading>
        <List hasDividers>
          {profileData?.education ? (
            <ListItem
              label={t("profile.wentTo", { place: profileData.education })}
              startContent={<i className="fa-solid fa-graduation-cap" />}
            />
          ) : null}

          {profileData?.city ? (
            <ListItem
              label={t("profile.livesIn", { place: profileData.city })}
              startContent={<i className="fa-solid fa-house-chimney" />}
            />
          ) : null}
          {profileData?.from ? (
            <ListItem
              label={t("profile.from", { place: profileData.from })}
              startContent={<i className="fa-solid fa-location-dot" />}
            />
          ) : null}
          {profileData?.relationship ? (
            <ListItem
              label={profileData.relationship}
              startContent={<i className="fa-solid fa-heart" />}
            />
          ) : null}

          <ListItem
            label={t("profile.joined", { time: moment(user.createAt).fromNow() })}
            startContent={<i className="fa-solid fa-clock" />}
          />
        </List>
        {userData?.id === user.id ? (
          <Button
            label={t("profile.editDetails")}
            variant="secondary"
            width="100%"
            onClick={() => setOpenDetailsModal(true)}
          />
        ) : null}
      </Stack>
    </Card>
  );

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
          integrity="sha512-9usAa10IRO0HhonpyAIVpjrylPvoDwiPUiKdWk5t3PyolY1cOd4DSE0Ga+ri4AuTroPR5aQvXU9xC6qOPnzFeg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <Card padding={0} elevation="low">
        {/* Ảnh bìa tràn viền trên của card, bo góc trên khớp card (16px). */}
        <Stack className="relative h-44 w-full overflow-hidden rounded-t-2xl sm:h-56">
          {hasRealCover ? (
            <Image
              src={userData.coverImage}
              alt={userData.fullName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1000px"
            />
          ) : (
            <Stack
              hAlign="center"
              vAlign="center"
              className="h-full w-full bg-line">
              <i className="fa-regular fa-image text-4xl text-muted/40" />
            </Stack>
          )}
        </Stack>
        <Stack gap={4} padding={5} paddingBlockStart={0}>
          {/* Avatar chồng lên bìa (viền ring-surface tách khỏi bìa) +
              cụm nút action căn đáy avatar; mobile nút wrap xuống dòng riêng. */}
          <HStack
            justify="between"
            vAlign="end"
            wrap="wrap"
            gap={4}>
            <Stack className="-mt-14 shrink-0 sm:-mt-16">
              <Stack className="rounded-full shadow-sm ring-4 ring-surface">
                <Avatar
                  src={userData?.avatar || "/images/user-avatar.png"}
                  name={userData?.fullName || userData?.username}
                  size={128}
                />
              </Stack>
            </Stack>
            <Stack gap={2} className="w-full sm:w-auto">
              <HStack gap={2} wrap="wrap" hAlign="end">
                {userData?.id === user.id ? (
                  <>
                    <Button
                      label={t("profile.editProfile")}
                      variant="primary"
                      onClick={() => setOpenProfileModal(true)}
                    />
                    {/* P3.4 — xin tick xanh (chưa xác minh và chưa gửi đơn). */}
                    {!userData?.verified && !verifySent && (
                      <Button
                        label={t("profile.requestVerification")}
                        variant="secondary"
                        onClick={() => setVerifyOpen((v) => !v)}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {renderFriendsButton()}
                    {/* P4.1 — theo dõi / bỏ theo dõi. */}
                    <FollowButton
                      userId={userData.id}
                      initialFollowing={followStatus?.following}
                      className="text-sm"
                      onChange={(following) =>
                        setFollowStatus((prev) =>
                          prev
                            ? {
                                ...prev,
                                following,
                                followerCount: Math.max(
                                  0,
                                  prev.followerCount + (following ? 1 : -1)
                                ),
                              }
                            : prev
                        )
                      }
                    />
                    {/* P3.2 — chặn / bỏ chặn user này. */}
                    <Button
                      label={blocked ? t("profile.unblock") : t("profile.block")}
                      variant="secondary"
                      onClick={async () => {
                        try {
                          if (blocked) {
                            await unblockUser(userData.id);
                            setBlocked(false);
                            toast.success(t("settings.unblocked"));
                          } else {
                            await blockUser(userData.id);
                            setBlocked(true);
                            toast.success(t("profile.blocked"));
                          }
                        } catch {
                          toast.error(t("profile.actionFailed"));
                        }
                      }}
                    />
                  </>
                )}
              </HStack>
              {verifyOpen && !userData?.verified && (
                <Card padding={3} width={288}>
                  <Stack gap={2}>
                    <TextArea
                      label={t("profile.verifyReasonLabel")}
                      isLabelHidden
                      rows={3}
                      placeholder={t("profile.verifyReasonPlaceholder")}
                      value={verifyReason}
                      onChange={(value) => setVerifyReason(value)}
                    />
                    <Button
                      label={t("profile.submitVerification")}
                      variant="primary"
                      onClick={async () => {
                        try {
                          await requestVerification(verifyReason);
                          setVerifySent(true);
                          setVerifyOpen(false);
                          toast.success(t("profile.verificationSent"));
                        } catch {
                          toast.error(t("profile.verificationFailed"));
                        }
                      }}
                    />
                  </Stack>
                </Card>
              )}
            </Stack>
          </HStack>
          {/* Tên + email. */}
          <Stack gap={1} className="min-w-0">
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Text weight="bold" size="xl">
                {userData?.fullName}
              </Text>
              <VerifiedBadge verified={userData?.verified} />
            </HStack>

            <Text type="supporting" className="break-all">
              <Link
                href={`mailto:${userData?.email}`}
                color="secondary"
                type="supporting">
                {userData?.email}
              </Link>
            </Text>
          </Stack>
          {/* Stats: số bài (từ dữ liệu đã tải) + follow, bấm để xem danh sách. */}
          <HStack gap={2} wrap="wrap">
            {data ? (
              <Button
                label={t("profile.postsCount", { count: postCountLabel })}
                variant="ghost"
                onClick={() => setTab("posts")}>
                <Text weight="bold" size="lg">
                  {postCountLabel}
                </Text>{" "}
                <Text type="supporting">{t("profile.posts")}</Text>
              </Button>
            ) : null}
            {/* P4.1 — số người theo dõi / đang theo dõi, bấm để xem danh sách. */}
            {followStatus && (
              <>
                <Button
                  label={t("follow.followersCount", { count: followStatus.followerCount })}
                  variant="ghost"
                  onClick={() => setFollowListKind("followers")}>
                  <Text weight="bold" size="lg">
                    {followStatus.followerCount}
                  </Text>{" "}
                  <Text type="supporting">{t("profile.followers")}</Text>
                </Button>
                <Button
                  label={t("profile.followingCount", { count: followStatus.followingCount })}
                  variant="ghost"
                  onClick={() => setFollowListKind("following")}>
                  <Text weight="bold" size="lg">
                    {followStatus.followingCount}
                  </Text>{" "}
                  <Text type="supporting">{t("profile.following")}</Text>
                </Button>
              </>
            )}
          </HStack>
          {/* Tabs: Bài viết / Giới thiệu đổi nội dung ngay trên trang,
              Bạn bè sang trang /friends (giữ nguyên đích cũ). */}
          <SegmentedControl
            value={tab}
            onChange={(value) => {
              if (value === "friends") {
                router.push("/friends");
                return;
              }
              setTab(value as "posts" | "about");
            }}
            label={t("profile.switchView")}
            layout="fill">
            <SegmentedControlItem value="posts" label={t("profile.posts")} />
            <SegmentedControlItem value="about" label={t("profile.about")} />
            <SegmentedControlItem value="friends" label={t("profile.friends")} />
          </SegmentedControl>
        </Stack>
      </Card>

      {tab === "posts" ? (
        <HStack wrap="wrap" gap={4} vAlign="start" paddingBlockStart={3}>
          {/* Sidebar About chỉ hiện từ sm trở lên; mobile xem qua tab Giới thiệu. */}
          <Stack className="hidden shrink-0 sm:block">
            {renderAboutCard(300)}
          </Stack>
          <StackItem size="fill">
            <Stack gap={4}>
              {/* create post */}
              {userData?.id === user.id && (
                <CreatePost setNewPost={setNewPost} />
              )}
              {data?.pages.map((data) => (
                <Fragment key={data?.page}>
                  {data?.posts &&
                    data?.posts
                      .map((post) => (
                        <SinglePost
                          loading={false}
                          bookmarkedPostsId={bookmarkedPostsId || []}
                          key={post.uuid}
                          post={post}
                          deletePost={deletePost}
                          setDeletePost={setDeletePost}
                          isBookmarkPage={false}
                        />
                      ))
                      .reverse()}
                </Fragment>
              ))}

              <Button
                label={
                  isFetchingNextPage
                    ? t("feed.loadingMore")
                    : hasNextPage
                      ? t("feed.loadMore")
                      : t("feed.nothingMore")
                }
                variant="ghost"
                ref={loadMoreRef}
                onClick={() => fetchNextPage()}
                isDisabled={!hasNextPage || isFetchingNextPage}
                isLoading={isFetchingNextPage}
              />
              {isFetching && !isFetchingNextPage ? (
                <Text type="supporting">{t("feed.fetching")}</Text>
              ) : null}
            </Stack>
          </StackItem>
        </HStack>
      ) : (
        <Center axis="horizontal">
          <Stack width="100%" maxWidth={560} paddingBlockStart={3}>
            {renderAboutCard("100%")}
          </Stack>
        </Center>
      )}
      {/* Edit Profile Modal */}
      <ProfileModal
        data={user}
        open={openProfileModal}
        setOpenProfileModal={setOpenProfileModal}
        setUpdateUserData={setUpdateUserData}
      />
      {/* Edit About Modal */}
      <AboutModal
        data={profileData}
        openDetailsModal={openDetailsModal}
        setOpenDetailsModal={setOpenDetailsModal}
        setUpdateUserData={setUpdateUserData}
      />
      {/* P4.1 — danh sách người theo dõi / đang theo dõi. */}
      {followListKind && (
        <FollowListModal
          userId={userData.id}
          kind={followListKind}
          title={
            followListKind === "followers"
              ? t("profile.followersTitle")
              : t("profile.followingTitle")
          }
          open={followListKind !== null}
          onClose={() => setFollowListKind(null)}
          currentUserId={user.id}
        />
      )}
    </>
  );
};

export default UserProfile;
