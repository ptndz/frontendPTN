import { useState } from "react";
import { useStoreUser } from "../../store/user";
import Image from "next/image";
import { FaArrowUp } from "react-icons/fa";
import { IComment } from "../../gql/graphql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { graphql } from "../../gql";
interface IProps {
  comment: IComment;
  isOpenComment: boolean;
  setNewComment: (comment: IComment) => void;
}
const AddComment: React.FC<IProps> = ({
  comment,
  isOpenComment,
  setNewComment,
}) => {
  const { user } = useStoreUser();
  const [commentValue, setCommentValue] = useState("");
  const handleSubmit = async () => {
    const queryCommentComment = graphql(`
      mutation commentComment($commentId: Float!, $content: String!) {
        commentComment(commentId: $commentId, content: $content) {
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
        }
      }
    `);
    const res = await graphQLClient.request(queryCommentComment, {
      commentId: comment.id,
      content: commentValue,
    });

    if (graphQLClientErrorCheck(res)) {
      if (res.commentComment.comment) {
        setNewComment(res.commentComment.comment);
        setCommentValue("");
      }
    }
  };
  if (isOpenComment) {
    return (
      <div>
        <div className="flex gap-2 items-center pt-5">
          <div className="relative">
            <Image
              src={user.avatar || "/images/user-avatar.png"}
              alt={user.fullName}
              height="50"
              width="50"
              className="rounded-full"
            />
          </div>
          <div className="w-full">
            <input
              onChange={(e) => setCommentValue(e.target.value)}
              value={commentValue}
              className="w-full h-10 dark:bg-zinc-800 bg-gray-200 rounded-full p-2 resize-none scrollbar-hide"
              placeholder="Wright a comment ..."
            />
          </div>
          <div className="w-10 flex  items-center justify-center p-3 rounded-full bg-blue-600">
            <button
              disabled={!commentValue.trim()}
              type="submit"
              onClick={handleSubmit}
              className="disabled:cursor-not-allowed">
              <FaArrowUp className=" text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default AddComment;
