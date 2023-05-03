import { graphql } from "../../gql";
import { IComment } from "../../gql/graphql";
import { FaRegSurprise } from "react-icons/fa";

import { AiOutlineLike } from "react-icons/ai";
import { TbMoodCry } from "react-icons/tb";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { BsEmojiAngry, BsHeart } from "react-icons/bs";
import { CgSmileMouthOpen } from "react-icons/cg";
import { useEffect, useId, useState } from "react";
import { useStoreUser } from "../../store/user";
interface IProps {
  comment: IComment;
}
const Like: React.FC<IProps> = ({ comment }) => {
  const { user } = useStoreUser();
  const [like, setLike] = useState<string>("");
  const idLike = useId();
  useEffect(() => {
    const isLikePost = comment?.likes?.find((item) => item.user.id === user.id);
    setLike(isLikePost ? isLikePost.reactions : "");
  }, [comment?.likes, user.id]);
  const handleLike = async (typeReact: string) => {
    const queryLike = graphql(`
      mutation likeComment($commentId: Float!, $typeReact: String!) {
        likeComment(commentId: $commentId, typeReact: $typeReact) {
          code
          success
          message
          like {
            id
            reactions
            user {
              fullName
              username
            }
          }
        }
      }
    `);
    const res = await graphQLClient.request(queryLike, {
      commentId: comment.id,
      typeReact: typeReact,
    });
    if (graphQLClientErrorCheck(res)) {
      if (res.likeComment.like) {
        setLike(res.likeComment.like.reactions);
      }
    }
  };
  const renderHover = () => {
    return (
      <div className="box pt-2 pb-0 px-1.5">
        <input type="checkbox" id={idLike} className="field-reactions" />
        <label htmlFor={idLike} className="label-reactions">
          Like
        </label>
        <span className="text-desc">
          Press space and after tab key to navigation
        </span>
        <div className="toolbox"></div>
        <label className="overlay" htmlFor={idLike}></label>
        <div
          key="LIKE"
          className="reaction-like"
          onClick={() => handleLike("LIKE")}>
          <span className="legend-reaction">Like</span>
        </div>
        <div
          key="LOVE"
          className="reaction-love"
          onClick={() => handleLike("LOVE")}>
          <span className="legend-reaction">Love</span>
        </div>
        <div
          key="HAHA"
          className="reaction-haha"
          onClick={() => handleLike("HAHA")}>
          <span className="legend-reaction">Haha</span>
        </div>
        <div
          key="WOW"
          className="reaction-wow"
          onClick={() => handleLike("WOW")}>
          <span className="legend-reaction">Wow</span>
        </div>
        <div
          key="SAD"
          className="reaction-sad"
          onClick={() => handleLike("SAD")}>
          <span className="legend-reaction">Sad</span>
        </div>
        <div
          key="ANGRY"
          className="reaction-angry"
          onClick={() => handleLike("ANGRY")}>
          <span className="legend-reaction">Angry</span>
        </div>
      </div>
    );
  };
  const renderLike = () => {
    const reactions = [
      {
        type: "LIKE",
        icon: (
          <button>
            {renderHover()}
            <AiOutlineLike className="text-2xl text-sky-600" />
          </button>
        ),
      },
      {
        type: "LOVE",
        icon: (
          <button>
            {renderHover()}
            <BsHeart className="text-2xl text-red-500" />
          </button>
        ),
      },
      {
        type: "HAHA",
        icon: (
          <button>
            {renderHover()}
            <CgSmileMouthOpen className="text-2xl text-yellow-400" />
          </button>
        ),
      },
      {
        type: "SAD",
        icon: (
          <button>
            {renderHover()}
            <TbMoodCry className="text-2xl text-yellow-400" />
          </button>
        ),
      },
      {
        type: "WOW",
        icon: (
          <button>
            {renderHover()}
            <FaRegSurprise className="text-2xl text-yellow-400" />
          </button>
        ),
      },
      {
        type: "ANGRY",
        icon: (
          <button>
            {renderHover()}
            <BsEmojiAngry className="text-2xl text-yellow-400" />
          </button>
        ),
      },
    ];
    const icon = reactions.find((item) => item.type === like)?.icon;
    return icon ? (
      icon
    ) : (
      <button>
        {renderHover()}
        Like
      </button>
    );
  };
  return (
    <span className="p-1 pt-2 pb-0 px-1.5 text-gray-600">{renderLike()}</span>
  );
};

export default Like;
