import React, { useEffect, useState } from "react";
import { IComment } from "../../gql/graphql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { queryCommentByCommentId } from "../../graphql/post";
import Comment from "./Comment";

interface IProps {
  comment: IComment;
  /**
   * Depth of the parent comment (1 = top-level). Children render at
   * min(parentDepth + 1, 2) so nesting never exceeds 2 levels.
   */
  parentDepth: number;
}

const CommentChild: React.FC<IProps> = ({ comment, parentDepth }) => {
  const [commentData, setCommentData] = useState<IComment[]>();

  useEffect(() => {
    if (comment.id) {
      const fetchData = async () => {
        try {
          const res = await graphQLClient.request(queryCommentByCommentId, {
            commentId: comment.id,
          });

          if (graphQLClientErrorCheck(res)) {
            if (res.getCommentComment.comments) {
              // W6: comments/likes là mảng nullable — lọc phần tử null ở
              // cả hai tầng (query đã select `verified` nên sau khi lọc
              // kết quả gán được cho IComment[]).
              setCommentData(
                res.getCommentComment.comments
                  .filter(
                    (comment): comment is NonNullable<typeof comment> =>
                      comment != null
                  )
                  .map((comment) => ({
                    ...comment,
                    likes: comment.likes?.filter(
                      (like): like is NonNullable<typeof like> =>
                        like != null
                    ),
                  }))
              );
            }
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchData();
    }
  }, [comment.id]);

  // Cap nesting at 2 levels: children of a level-2 comment are flattened
  // to level 2 (same single indent) and get an @mention of the parent
  // author, so it stays clear who they answer — even after a reload,
  // because the mention is derived from the parent, not stored anywhere.
  const childDepth = Math.min(parentDepth + 1, 2);
  const replyTo = parentDepth >= 2 ? comment.user.username : undefined;

  return (
    <>
      {commentData
        ? commentData.map((item) => (
            <Comment
              key={item.id}
              comment={item}
              depth={childDepth}
              replyTo={replyTo}
            />
          ))
        : null}
    </>
  );
};

export default CommentChild;
