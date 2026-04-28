import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { IComment } from "../../gql/graphql";

import CommentChild from "./CommentChild";
import Like from "./Like";
import AddComment from "./AddComment";
import Comment from "./Comment";

interface IProps {
  comment: IComment;
}

const Comments: React.FC<IProps> = ({ comment }) => {
  const [isComment, setIsComment] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<IComment>();

  return (
    <div className="flex gap-2 items-start py-2">
      <Link href={`/${comment.user.username}`} className="flex-shrink-0">
        <Image
          className="rounded-full cursor-pointer object-cover"
          src={comment.user.avatar || "/images/user-avatar.png"}
          alt={comment.user.username || ""}
          height={32}
          width={32}
        />
      </Link>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-2xl">
          <Link href={`/${comment.user.username}`}>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:underline">
              {comment.user.fullName}
            </p>
          </Link>
          <p className="text-sm text-gray-700 dark:text-gray-300 break-words">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-3 text-xs text-gray-500 dark:text-gray-400">
          <button
            onClick={() => setIsComment(!isComment)}
            className="font-medium hover:text-emerald-500 transition-colors"
          >
            Reply
          </button>
          <span>·</span>
          <Like comment={comment} />
        </div>
        <AddComment
          setNewComment={setNewComment}
          isOpenComment={isComment}
          comment={comment}
          setIsComment={setIsComment}
        />
        <CommentChild key={comment.id} comment={comment} />
        {newComment ? <Comment key={newComment.id} comment={newComment} /> : null}
      </div>
    </div>
  );
};

export default Comments;
