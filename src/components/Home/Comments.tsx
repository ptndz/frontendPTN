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
    <div className="w-full space-y-4">
      <div className="drop-shadow-sm p-3 rounded-lg">
        <div className="flex pt-3">
          <div className="flex py-2">
            <div className="w-10 h-10 rounded-full ml-1">
              <Link href={`/${comment.user.username}`} passHref>
                <Image
                  className="rounded-full cursor-pointer"
                  src={comment.user.avatar || "/images/user-avatar.png"}
                  alt={`${comment.user.username}`}
                  height={32}
                  width={32}
                />
              </Link>
            </div>
            <div className="flex flex-col">
              <div className="dark:bg-zinc-800 bg-slate-200 px-3 py-2 rounded-2xl ml-2">
                <div className="font-bold">
                  <Link href={`/${comment.user.username}`} passHref>
                    <h1 className="text-sm cursor-pointer">
                      {comment.user.fullName}
                    </h1>
                  </Link>
                </div>
                <div className="text-gray-600">
                  <div className="text-gray-600">{comment.content}</div>
                </div>
                <div className="pt-1">
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
              <CommentChild key={comment.id} comment={comment}></CommentChild>
              {newComment ? (
                <Comment key={newComment.id} comment={newComment}></Comment>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comments;
