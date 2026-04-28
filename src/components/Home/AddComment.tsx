import { useState } from "react";
import { useStoreUser } from "../../store/user";
import Image from "next/image";
import { HiPaperAirplane } from "react-icons/hi";
import { IComment } from "../../gql/graphql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { mutationCommentComment } from "../../graphql/post";

interface IProps {
  comment: IComment;
  isOpenComment: boolean;
  setNewComment: (comment: IComment) => void;
  setIsComment: (isComment: boolean) => void;
}

const AddComment: React.FC<IProps> = ({
  comment,
  isOpenComment,
  setNewComment,
  setIsComment,
}) => {
  const { user } = useStoreUser();
  const [commentValue, setCommentValue] = useState("");

  const handleSubmit = async () => {
    const res = await graphQLClient.request(mutationCommentComment, {
      commentId: comment.id,
      content: commentValue,
    });

    if (graphQLClientErrorCheck(res)) {
      if (res.commentComment.comment) {
        setNewComment(res.commentComment.comment);
        setCommentValue("");
        setIsComment(false);
      }
    }
  };

  if (!isOpenComment) return null;

  return (
    <div className="flex items-center gap-2 mt-2">
      <Image
        src={user.avatar || "/images/user-avatar.png"}
        alt={user.fullName || ""}
        height={32}
        width={32}
        className="rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 relative">
        <input
          onChange={(e) => setCommentValue(e.target.value)}
          value={commentValue}
          onKeyDown={(e) => {
            if (e.key === "Enter" && commentValue.trim().length > 0) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="w-full h-9 pl-3 pr-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
          placeholder="Write a reply..."
        />
        <button
          disabled={!commentValue.trim()}
          type="submit"
          onClick={handleSubmit}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <HiPaperAirplane className="w-3.5 h-3.5 text-white rotate-90" />
        </button>
      </div>
    </div>
  );
};

export default AddComment;
