import React, { useEffect, useRef, useState, useId } from "react";
import { formatRelativeTime } from "../../lib/time";
import { FaArrowUp, FaRegSurprise } from "react-icons/fa";
import { FiTrash, FiBookOpen, FiEdit } from "react-icons/fi";
import { FaGlobe, FaLock, FaUserFriends } from "react-icons/fa";
import { BiShare } from "react-icons/bi";
import { AiOutlineLike } from "react-icons/ai";
import { TbMoodCry } from "react-icons/tb";
import Comments from "./Comments";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  BsChatLeft,
  BsBookmark,
  BsBookmarkX,
  BsThreeDotsVertical,
  BsHeart,
  BsEmojiAngry,
} from "react-icons/bs";
import { MdBugReport } from "react-icons/md";
import { toast } from "react-toastify";
import { IComment } from "../../gql/graphql";
import type { PostWithExtras } from "../../types/social";
import { useStoreUser } from "../../store/user";
import { graphql } from "../../gql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { CgSmileMouthOpen } from "react-icons/cg";
import PostMedia from "./PostMedia";
import PollCard from "./PollCard";
import EditPostModal from "./EditPostModal";
import RichText from "../../lib/richText";
import axios from "axios";
import VerifiedBadge from "../Share/VerifiedBadge";
import { useI18n } from "../../i18n/I18nProvider";
import { Card } from "@astryxdesign/core/Card";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";

interface IProps {
  post: PostWithExtras;
  setDeletePost: (deletePost: boolean) => void;
  bookmarkedPostsId: string[];
  deletePost: boolean;
  isBookmarkPage: boolean;
  loading: boolean;
}

const SinglePost: React.FC<IProps> = ({
  post,
  setDeletePost,
  bookmarkedPostsId,
  deletePost,
  isBookmarkPage,
  loading,
}) => {
  const [displayPost, setDisplayPost] = useState(post);
  const [editOpen, setEditOpen] = useState(false);
  const [alreadyBookmarked, setAlreadyBookmarked] = useState(
    bookmarkedPostsId?.some((p: string) => p === displayPost.uuid)
  );
  const [like, setLike] = useState<string>("");
  // Like/react press feedback: `burst` triggers the pop + floating icon
  // (CSS `.like-pop` / `.like-float` in reaction.css). Cleared after 650ms;
  // `n` restarts the animation when the same reaction is picked twice fast.
  const [burst, setBurst] = useState<{ type: string; n: number } | null>(null);
  const burstTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSeeMore, setIsSeeMore] = useState<boolean>(false);
  const [dbComments, setDbComments] = useState<IComment[]>([]);
  const [comment, setComment] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportDetail, setReportDetail] = useState("");
  const [reporting, setReporting] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const idLike = useId();
  const { user } = useStoreUser();
  const { t } = useI18n();
  const router = useRouter();
  // Counts used for singular/plural labels (English inflects, Vietnamese does not).
  const likesCount =
    displayPost?.likesCount ?? displayPost?.likes?.length ?? 0;
  const commentsCount =
    displayPost.commentsCount ?? displayPost.comments?.length ?? 0;
  const sharesCount = displayPost.shares ?? 0;

  useEffect(() => {
    setDisplayPost(post);
  }, [post]);

  useEffect(() => {
    return () => {
      if (burstTimeout.current) clearTimeout(burstTimeout.current);
    };
  }, []);

  useEffect(() => {
    const isLikePost = displayPost?.likes?.find(
      (item) => item.user.username === user.username
    );
    setLike(isLikePost ? isLikePost.reactions : "");
  }, [displayPost, user.username]);

  useEffect(() => {
    if (displayPost.comments) {
      setDbComments(displayPost.comments);
    }
  }, [displayPost.comments]);

  useEffect(() => {
    if (displayPost.content.split("\n").length >= 6) {
      setIsSeeMore(false);
    }
  }, [displayPost.content]);

  const handleSubmitComment = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (comment.length < 1) {
      toast.error(t("feed.post.commentRequired"));
      return;
    }

    const queryCommentPost = graphql(`
      mutation commentPost($postUuid: String!, $content: String!) {
        commentPost(postUuid: $postUuid, content: $content) {
          code
          success
          message
          comment {
            id
            user {
              id
              username
              fullName
              avatar
            }
            content
            likes {
              id
              reactions
              user {
                id
                username
                fullName
                avatar
              }
            }
          }
          comments {
            id
            content
            user {
              id
              username
              fullName
              avatar
            }
            likes {
              id
              user {
                id
                username
                fullName
                avatar
              }
              reactions
            }
          }
        }
      }
    `);
    const res = await graphQLClient.request(queryCommentPost, {
      postUuid: displayPost.uuid,
      content: comment,
    });
    if (graphQLClientErrorCheck(res)) {
      if (res.commentPost.comments) {
        // C1/tsc: commentPost không select `verified` nên user thiếu field
        // bắt buộc của IUser; lọc null 2 tầng rồi cast (type-only, giống
        // mẫu đã làm ở CommentChild) — runtime không đổi.
        setDbComments(
          res.commentPost.comments
            .filter(
              (comment): comment is NonNullable<typeof comment> =>
                comment != null
            )
            .map((comment) => ({
              ...comment,
              likes: comment.likes?.filter(
                (like): like is NonNullable<typeof like> => like != null
              ),
            })) as unknown as IComment[]
        );
      }
      if (ref.current?.value) {
        ref.current.value = "";
        setComment("");
      }
    }
  };

  const handleLike = async (typeReact: string) => {
    // Optimistic press feedback (the mutation updates `like` on success).
    if (burstTimeout.current) clearTimeout(burstTimeout.current);
    setBurst((b) => ({ type: typeReact, n: (b?.n ?? 0) + 1 }));
    burstTimeout.current = setTimeout(() => setBurst(null), 650);
    const queryLike = graphql(`
      mutation likePost($postUuid: String!, $typeReact: String!) {
        likePost(postUuid: $postUuid, typeReact: $typeReact) {
          code
          success
          message
          like {
            id
            reactions
            user {
              fullName
              username
            }
          }
        }
      }
    `);
    try {
      const res = await graphQLClient.request(queryLike, {
        postUuid: displayPost.uuid,
        typeReact: typeReact,
      });
      if (graphQLClientErrorCheck(res)) {
        if (res.likePost.like) {
          setLike(res.likePost.like.reactions);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDelete = async (uuid: string) => {
    const queryDeletePost = graphql(`
      mutation deletePost($uuid: String!) {
        deletePost(uuid: $uuid) {
          code
          success
          message
          post {
            uuid
            content
            createAt
            updateAt
            images
          }
          errors {
            field
            message
          }
        }
      }
    `);
    const res = await graphQLClient.request(queryDeletePost, {
      uuid: uuid,
    });

    if (graphQLClientErrorCheck(res)) {
      setDeletePost(!deletePost);
    }
  };

  const handleBookmark = async (uuid: string) => {
    try {
      const queryBookmarkPost = graphql(`
        query createBookmark($postUuid: String!) {
          createBookmark(postUuid: $postUuid) {
            code
            success
            bookmarks {
              user {
                username
                fullName
                avatar
              }
              post {
                uuid
                content
                createAt
                updateAt
                shares
                likesCount
                commentsCount
                images
                user {
                  username
                  fullName
                }
                likes {
                  id
                  reactions
                }
                comments {
                  id
                  content
                  likes {
                    id
                    reactions
                  }
                  user {
                    id
                    username
                    avatar
                    fullName
                  }
                }
              }
            }
          }
        }
      `);
      const res = await graphQLClient.request(queryBookmarkPost, {
        postUuid: uuid,
      });
      if (graphQLClientErrorCheck(res)) {
        setAlreadyBookmarked(true);
      }
    } catch (error) {
      toast.error(uuid);
    }
  };

  const handleBookmarkRemove = async (uuid: string) => {
    try {
      setAlreadyBookmarked(false);
    } catch (error) {
      toast.error(uuid);
    }
  };
  const REPORT_REASONS = [
    t("feed.post.reportReasons.spam"),
    t("feed.post.reportReasons.violence"),
    t("feed.post.reportReasons.harassment"),
    t("feed.post.reportReasons.misinformation"),
    t("feed.post.reportReasons.adult"),
    t("feed.post.reportReasons.other"),
  ];
  const handleReport = async (uuid: string) => {
    const reason = reportDetail.trim() || reportReason;
    setReporting(true);
    try {
      await axios.post("/reports", {
        targetType: "post",
        targetId: uuid,
        reason,
      });
      toast.success(t("feed.post.reportSuccess"));
      setReportOpen(false);
      setReportDetail("");
      setMenuOpen(false);
    } catch (error) {
      toast.error(t("feed.post.reportFailed"));
    } finally {
      setReporting(false);
    }
  };
  // Icon for a reaction type (used by the Like button + the float effect).
  const reactionIconFor = (type: string) => {
    switch (type) {
      case "LIKE":
        return <AiOutlineLike className="text-2xl text-accent-bright" />;
      case "LOVE":
        return <BsHeart className="text-2xl text-danger" />;
      case "HAHA":
        return <CgSmileMouthOpen className="text-2xl text-warning" />;
      case "SAD":
        return <TbMoodCry className="text-2xl text-warning" />;
      case "WOW":
        return <FaRegSurprise className="text-2xl text-warning" />;
      case "ANGRY":
        return <BsEmojiAngry className="text-2xl text-warning" />;
      default:
        return <BsHeart className="text-2xl" />;
    }
  };

  const renderLike = () => {
    const icon = like ? reactionIconFor(like) : <BsHeart className="text-2xl" />;
    return (
      <button>
        {/* Keyed by the burst counter so the pop restarts on a fast re-pick.
            The span wraps only the icon (a sibling of the picker), never the
            picker itself, so the pop never resets the picker checkbox. */}
        <span key={burst?.n ?? 0} className={burst ? "like-pop" : ""}>
          {icon}
        </span>
      </button>
    );
  };

  return (
    <Card padding={5}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" hAlign="between">
          <HStack gap={3} vAlign="center">
            <Link href={`/${displayPost.user.username}`} passHref>
              <Avatar
                src={displayPost.user.avatar || "/images/user-avatar.png"}
                name={displayPost.user.fullName}
                size={48}
                tooltip={false}
              />
            </Link>
            <VStack gap={0}>
              <Link href={`/${displayPost.user.username}`} passHref>
                <Text weight="semibold" as="span" className="flex items-center gap-1 cursor-pointer">
                  {displayPost.user.fullName}
                  <VerifiedBadge verified={displayPost.user.verified} />
                </Text>
              </Link>
              <Text type="supporting" as="span" className="flex items-center gap-1">
                {formatRelativeTime(displayPost.createAt)}{" "}
                {/* P1.5 — icon quyền xem của bài */}
                {displayPost.audience === "friends" ? (
                  <FaUserFriends title={t("feed.post.audienceFriendsTitle")} />
                ) : displayPost.audience === "only-me" ? (
                  <FaLock title={t("feed.post.audienceOnlyMeTitle")} />
                ) : (
                  <FaGlobe title={t("feed.post.audiencePublicTitle")} />
                )}
              </Text>
            </VStack>
          </HStack>
          <DropdownMenu
            isMenuOpen={menuOpen}
            onOpenChange={setMenuOpen}
            menuWidth={256}
            placement="below"
            alignment="end"
            renderTrigger={(triggerProps) => (
              <IconButton
                {...triggerProps}
                label={t("feed.post.openPost")}
                icon={<BsThreeDotsVertical />}
                variant="ghost"
                size="lg"
              />
            )}
            items={[
              alreadyBookmarked
                ? {
                    id: "remove-bookmark",
                    label: t("feed.post.removeBookmark"),
                    icon: <BsBookmarkX />,
                    onClick: () => {
                      handleBookmarkRemove(displayPost.uuid);
                      setMenuOpen(false);
                    },
                  }
                : {
                    id: "bookmark",
                    label: t("feed.post.bookmark"),
                    icon: <BsBookmark />,
                    onClick: () => {
                      handleBookmark(displayPost.uuid);
                      setMenuOpen(false);
                    },
                  },
              {
                id: "report",
                label: t("feed.post.report"),
                icon: <MdBugReport />,
                onClick: () => {
                  setReportOpen(true);
                  setMenuOpen(false);
                },
              },
              ...(user.username === displayPost.user.username
                ? [
                    {
                      id: "edit",
                      label: t("feed.post.editPost"),
                      icon: <FiEdit />,
                      onClick: () => {
                        setEditOpen(true);
                        setMenuOpen(false);
                      },
                    },
                    {
                      id: "delete",
                      label: t("feed.post.deletePosts"),
                      icon: <FiTrash />,
                      onClick: () => {
                        handleDelete(displayPost.uuid);
                        setMenuOpen(false);
                      },
                    },
                  ]
                : []),
              {
                id: "open",
                label: t("feed.post.openPost"),
                icon: <FiBookOpen />,
                onClick: () => {
                  setMenuOpen(false);
                  router.push(`/post/${displayPost.uuid}`);
                },
              },
            ]}
          />
        </HStack>
        {reportOpen ? (
          <VStack gap={2} className="rounded-lg border border-line bg-paper p-3">
            <Text weight="semibold">{t("feed.post.reportTitle")}</Text>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="field w-full">
              {REPORT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <TextInput
              label={t("feed.post.reportDetailPlaceholder")}
              isLabelHidden
              value={reportDetail}
              onChange={setReportDetail}
              placeholder={t("feed.post.reportDetailPlaceholder")}
            />
            <HStack gap={2} hAlign="end">
              <Button
                label={t("common.cancel")}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReportOpen(false);
                  setMenuOpen(false);
                }}
              />
              <Button
                label={
                  reporting ? t("feed.post.sending") : t("feed.post.sendReport")
                }
                variant="primary"
                size="sm"
                isLoading={reporting}
                onClick={() => handleReport(displayPost.uuid)}
              />
            </HStack>
          </VStack>
        ) : null}
        <VStack gap={0}>
          {isSeeMore
            ? displayPost.content.split("\n").map(function (item, idx) {
                return (
                  <Text as="p" key={idx}>
                    <RichText text={item} />
                  </Text>
                );
              })
            : displayPost.content.split("\n").map(function (item, idx) {
                if (idx <= 5) {
                  return (
                    <Text as="p" key={idx}>
                      <RichText text={item} />
                    </Text>
                  );
                }
              })}

          {displayPost.content.split("\n").length >= 6 && (
            <Button
              label={isSeeMore ? t("feed.post.seeLess") : t("feed.post.seeMore")}
              variant="ghost"
              size="sm"
              onClick={() => setIsSeeMore(!isSeeMore)}
            />
          )}
        </VStack>
        {/* P1.2 — ảnh qua Carousel cũ, video qua <video> (xem PostMedia) */}
        {displayPost.images ? <PostMedia images={displayPost.images} /> : null}
        {/* P1.3 — poll của bài (nếu có) */}
        {displayPost.poll ? (
          <PollCard poll={displayPost.poll} postUuid={displayPost.uuid} />
        ) : null}
        <HStack gap={2} vAlign="center" hAlign="between" className="relative">
          <HStack gap={2} vAlign="center">
            <div className="box pt-2 pb-0 px-1.5">
              <input type="checkbox" id={idLike} className="field-reactions" />
              <label htmlFor={idLike} className="label-reactions">
                {t("feed.post.like")}
              </label>
              <span className="text-desc">
                Press space and after tab key to navigation
              </span>
              <div className="toolbox" />
              <label className="overlay" htmlFor={idLike} />
              <button
                className={`reaction-like${like === "LIKE" ? " reaction-current" : ""}`}
                onClick={() => handleLike("LIKE")}>
                <span className="legend-reaction">{t("feed.reaction.like")}</span>
              </button>
              <button
                className={`reaction-love${like === "LOVE" ? " reaction-current" : ""}`}
                onClick={() => handleLike("LOVE")}>
                <span className="legend-reaction">{t("feed.reaction.love")}</span>
              </button>
              <button
                className={`reaction-haha${like === "HAHA" ? " reaction-current" : ""}`}
                onClick={() => handleLike("HAHA")}>
                <span className="legend-reaction">{t("feed.reaction.haha")}</span>
              </button>
              <button className={`reaction-wow${like === "WOW" ? " reaction-current" : ""}`} onClick={() => handleLike("WOW")}>
                <span className="legend-reaction">{t("feed.reaction.wow")}</span>
              </button>
              <button className={`reaction-sad${like === "SAD" ? " reaction-current" : ""}`} onClick={() => handleLike("SAD")}>
                <span className="legend-reaction">{t("feed.reaction.sad")}</span>
              </button>
              <button
                className={`reaction-angry${like === "ANGRY" ? " reaction-current" : ""}`}
                onClick={() => handleLike("ANGRY")}>
                <span className="legend-reaction">{t("feed.reaction.angry")}</span>
              </button>
            </div>
            <span className="like-action p-1 pt-2 pb-0 px-1.5">
              {renderLike()}
              {burst && (
                <span key={burst.n} className="like-float">
                  {reactionIconFor(burst.type)}
                </span>
              )}
            </span>
            {/* Keyed by count + like state so the count pops when it changes. */}
            <span key={`${likesCount}-${like}`} className="count-pop">
              {like ? (
                <Text as="span">
                  {likesCount === 1
                    ? t("feed.post.likedByOne", { count: likesCount })
                    : t("feed.post.likedBy", { count: likesCount })}
                </Text>
              ) : (
                <Text as="span">
                  {likesCount === 1
                    ? t("feed.post.likesCountOne", { count: likesCount })
                    : t("feed.post.likesCount", { count: likesCount })}
                </Text>
              )}
            </span>

            <Button
              label={
                commentsCount === 1
                  ? t("feed.post.commentsOne", { count: commentsCount })
                  : t("feed.post.comments", { count: commentsCount })
              }
              icon={<BsChatLeft />}
              variant="ghost"
              size="sm"
            />
          </HStack>
          <Button
            label={
              sharesCount === 1
                ? t("feed.post.sharesOne", { count: sharesCount })
                : t("feed.post.shares", { count: sharesCount })
            }
            icon={<BiShare />}
            variant="ghost"
            size="sm"
          />
        </HStack>
        <form onSubmit={handleSubmitComment}>
          <HStack gap={2} vAlign="center">
            <Avatar
              src={user.avatar || "/images/user-avatar.png"}
              name={user.fullName}
              size={48}
              tooltip={false}
            />
            <StackItem size="fill">
              <input
                onChange={(e) => setComment(e.target.value)}
                ref={ref}
                className="field rounded-full resize-none scrollbar-hide"
                placeholder={t("feed.post.writeComment")}
              />
            </StackItem>
            <IconButton
              label={t("feed.post.writeComment")}
              icon={<FaArrowUp />}
              variant="primary"
              size="lg"
              isDisabled={!comment.trim()}
              type="submit"
            />
          </HStack>
        </form>
        {dbComments
          ?.map((comment) => <Comments key={comment.id} comment={comment} />)
          .reverse()}
        {/* P1.5 — modal sửa bài (chỉ chủ bài mới mở được từ menu) */}
        <EditPostModal
          post={displayPost}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) =>
            setDisplayPost((prev) => ({ ...prev, ...updated }))
          }
        />
      </VStack>
    </Card>
  );
};

export default SinglePost;
