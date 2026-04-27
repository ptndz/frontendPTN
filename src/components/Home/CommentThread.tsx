import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { IComment } from "../../gql/graphql";
import CommentChild from "./CommentChild";
import Like from "./Like";
import AddComment from "./AddComment";

interface IProps {
  comment: IComment;
  isRoot?: boolean;
}

const CommentThread: React.FC<IProps> = ({ comment, isRoot }) => {
  const [isComment, setIsComment] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<IComment>();

  const body = (
    <>
      <div className={`w-10 h-10 rounded-full${isRoot ? " ml-1" : ""}`}>
        <Link href={`/${comment.user.username}`} passHref>
          <Image
            className="rounded-full cursor-pointer"
            src={comment.user.avatar || "/images/user-avatar.png"}
            alt={comment.user.username}
            height={32}
            width={32}
          />
        </Link>
      </div>
      <div className="flex flex-col">
        <div className="dark:bg-zinc-800 bg-slate-200 px-3 py-2 rounded-2xl ml-2">
          <div className="font-bold">
            <Link href={`/${comment.user.username}`} passHref>
              <h1 className="text-sm cursor-pointer">{comment.user.fullName}</h1>
            </Link>
          </div>
          <div className="text-gray-600">{comment.content}</div>
          <div className={isRoot ? "pt-1" : undefined}>
            <button
              onClick={() => setIsComment(!isComment)}
              className="text-gray-600 hover:text-blue-400">
              Reply
            </button>
            <span className="mx-2">|</span>
            <Like comment={comment} />
          </div>
        </div>
        <AddComment
          setNewComment={setNewComment}
          isOpenComment={isComment}
          comment={comment}
          setIsComment={setIsComment}
        />
        <CommentChild comment={comment} />
        {newComment && <CommentThread key={newComment.id} comment={newComment} />}
      </div>
    </>
  );

  if (isRoot) {
    return (
      <div className="w-full space-y-4">
        <div className="drop-shadow-sm p-3 rounded-lg">
          <div className="flex pt-3">
            <div className="flex py-2">{body}</div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="flex py-2 ml-10">{body}</div>;
};

export default CommentThread;
