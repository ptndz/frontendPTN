import Link from "next/link";
import React, { useState } from "react";
import { IComment } from "../../gql/graphql";

import CommentChild from "./CommentChild";
import Like from "./Like";
import AddComment from "./AddComment";
import Comment from "./Comment";
import { useI18n } from "../../i18n/I18nProvider";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

interface IProps {
  comment: IComment;
}

const Comments: React.FC<IProps> = ({ comment }) => {
  const { t } = useI18n();
  const [isComment, setIsComment] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<IComment>();

  return (
    <HStack gap={2} vAlign="start" className="w-full p-3">
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
              <Text weight="bold" size="sm" as="span" className="cursor-pointer">
                {comment.user.fullName}
              </Text>
            </Link>
            <Text color="secondary">{comment.content}</Text>
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
          <CommentChild
            key={comment.id}
            comment={comment}
            parentDepth={1}
          ></CommentChild>
          {newComment ? (
            <Comment
              key={newComment.id}
              comment={newComment}
              depth={2}
            ></Comment>
          ) : null}
        </VStack>
      </StackItem>
    </HStack>
  );
};

export default Comments;
