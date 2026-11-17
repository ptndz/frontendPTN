import Link from "next/link";
import React, { useState } from "react";
import { IComment } from "../../gql/graphql";
import CommentChild from "./CommentChild";
import Like from "./Like";
import AddComment from "./AddComment";
import RichText from "../../lib/richText";
import VerifiedBadge from "../Share/VerifiedBadge";
import { useI18n } from "../../i18n/I18nProvider";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

interface IProps {
  comment: IComment;
  /**
   * Nesting level this comment renders at (1 = top-level, 2 = reply).
   * Capped at 2 — deeper replies are flattened to level 2.
   */
  depth?: number;
  /**
   * Username this comment answers, shown as an @mention before the
   * content. Set for flattened level-3+ replies.
   */
  replyTo?: string;
}

const Comment: React.FC<IProps> = ({ comment, depth = 2, replyTo }) => {
  const { t } = useI18n();
  const [isComment, setIsComment] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<IComment>();
  return (
    <>
      <HStack
        gap={2}
        vAlign="start"
        className={depth >= 2 ? "ml-10 py-2" : "py-2"}
      >
      <Link href={`/${comment.user.username}`} passHref>
        <Avatar
          src={comment.user.avatar || "/images/user-avatar.png"}
          name={comment.user.fullName}
          size={32}
          tooltip={false}
        />
      </Link>
      <StackItem size="fill">
        <VStack gap={2}>
          <VStack gap={0} className="relative rounded-2xl bg-paper px-3 py-2">
            <Link href={`/${comment.user.username}`} passHref>
              <Text weight="bold" size="sm" as="span" className="flex cursor-pointer items-center gap-1">
                {comment.user.fullName}
                <VerifiedBadge verified={comment.user.verified} />
              </Text>
            </Link>
            <Text color="secondary">
              {replyTo ? (
                <Link
                  href={`/${replyTo}`}
                  className="text-accent-bright hover:underline font-medium"
                >
                  @{replyTo}{" "}
                </Link>
              ) : null}
              <RichText text={comment?.content ?? ""} />
            </Text>
            <HStack gap={2} vAlign="center">
              <Button
                label={t("feed.comment.reply")}
                variant="ghost"
                size="sm"
                onClick={() => setIsComment(!isComment)}
              />
              <Text color="secondary" as="span">|</Text>
              <Like comment={comment} />
            </HStack>
          </VStack>
          <AddComment
            setNewComment={setNewComment}
            isOpenComment={isComment}
            comment={comment}
            setIsComment={setIsComment}
          />
        </VStack>
      </StackItem>
      </HStack>
      {/* Replies render as SIBLINGS of this comment (flat, same single
          indent) — never nested inside it, so the indent can't accumulate
          past one level and the UI can't widen. */}
      <CommentChild comment={comment} parentDepth={depth}></CommentChild>
      {newComment ? (
        <Comment
          key={newComment.id}
          comment={newComment}
          depth={2}
          replyTo={depth >= 2 ? comment.user.username : undefined}
        ></Comment>
      ) : null}
    </>
  );
};

export default Comment;
