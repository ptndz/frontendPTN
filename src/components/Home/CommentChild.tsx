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
}

const CommentChild: React.FC<IProps> = ({ comment }) => {
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
              setCommentData(res.getCommentComment.comments);
            }
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchData();
    }
  }, [comment.id]);

  return (
    <>
      {commentData
        ? commentData.map((item) => <Comment key={item.id} comment={item} />)
        : null}
    </>
  );
};

export default CommentChild;
