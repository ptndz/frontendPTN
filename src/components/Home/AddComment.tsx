import { useState } from "react";
import { useStoreUser } from "../../store/user";
import { FaArrowUp } from "react-icons/fa";
import { IComment } from "../../gql/graphql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { graphql } from "../../gql";
import { useI18n } from "../../i18n/I18nProvider";
import { Avatar } from "@astryxdesign/core/Avatar";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack } from "@astryxdesign/core/HStack";
import { StackItem } from "@astryxdesign/core/Stack";
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
  setIsComment
}) => {
  const { user } = useStoreUser();
  const { t } = useI18n();
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
        // W6: mutation này không select `verified` của user nên kết quả
        // không gán trực tiếp được cho IComment (verified: Boolean!) —
        // cast, không đổi dữ liệu runtime (đối tượng vốn đã thiếu verified).
        setNewComment(res.commentComment.comment as IComment);
        setCommentValue("");
        setIsComment(false);
      }
    }
  };
  if (isOpenComment) {
    return (
      <HStack gap={2} vAlign="center" className="pt-5">
        <Avatar
          src={user.avatar || "/images/user-avatar.png"}
          name={user.fullName}
          size={48}
          tooltip={false}
        />
        <StackItem size="fill">
          <input
            onChange={(e) => setCommentValue(e.target.value)}
            value={commentValue}
            onKeyPress={(e) => {
              if (commentValue.length > 0) {
                if (e.charCode === 13) {
                  handleSubmit();
                }
              }
            }}
            className="field rounded-full resize-none scrollbar-hide"
            placeholder={t("feed.post.writeComment")}
          />
        </StackItem>
        <IconButton
          label={t("feed.post.writeComment")}
          icon={<FaArrowUp />}
          variant="primary"
          size="lg"
          isDisabled={!commentValue.trim()}
          type="button"
          onClick={handleSubmit}
        />
      </HStack>
    );
  } else {
    return null;
  }
};

export default AddComment;
