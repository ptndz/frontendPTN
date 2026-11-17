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
import { useEffect, useId, useRef, useState } from "react";
import { useStoreUser } from "../../store/user";
import { useI18n } from "../../i18n/I18nProvider";
interface IProps {
  comment: IComment;
}
const Like: React.FC<IProps> = ({ comment }) => {
  const { user } = useStoreUser();
  const { t } = useI18n();
  const [like, setLike] = useState<string>("");
  // Like/react press feedback: `burst` triggers the pop + floating icon
  // (CSS `.like-pop` / `.like-float` in reaction.css). Cleared after 650ms;
  // `n` restarts the animation when the same reaction is picked twice fast.
  const [burst, setBurst] = useState<{ type: string; n: number } | null>(null);
  const burstTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idLike = useId();
  useEffect(() => {
    // W6: likes là Maybe<ILike>[] — phần tử có thể null.
    const isLikePost = comment?.likes?.find((item) => item?.user.id === user.id);
    setLike(isLikePost ? isLikePost.reactions : "");
  }, [comment?.likes, user.id]);
  useEffect(() => {
    return () => {
      if (burstTimeout.current) clearTimeout(burstTimeout.current);
    };
  }, []);
  const handleLike = async (typeReact: string) => {
    // Optimistic press feedback (the mutation updates `like` on success).
    if (burstTimeout.current) clearTimeout(burstTimeout.current);
    setBurst((b) => ({ type: typeReact, n: (b?.n ?? 0) + 1 }));
    burstTimeout.current = setTimeout(() => setBurst(null), 650);
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
          className={`reaction-like${like === "LIKE" ? " reaction-current" : ""}`}
          onClick={() => handleLike("LIKE")}>
          <span className="legend-reaction">{t("feed.reaction.like")}</span>
        </div>
        <div
          key="LOVE"
          className={`reaction-love${like === "LOVE" ? " reaction-current" : ""}`}
          onClick={() => handleLike("LOVE")}>
          <span className="legend-reaction">{t("feed.reaction.love")}</span>
        </div>
        <div
          key="HAHA"
          className={`reaction-haha${like === "HAHA" ? " reaction-current" : ""}`}
          onClick={() => handleLike("HAHA")}>
          <span className="legend-reaction">{t("feed.reaction.haha")}</span>
        </div>
        <div
          key="WOW"
          className={`reaction-wow${like === "WOW" ? " reaction-current" : ""}`}
          onClick={() => handleLike("WOW")}>
          <span className="legend-reaction">{t("feed.reaction.wow")}</span>
        </div>
        <div
          key="SAD"
          className={`reaction-sad${like === "SAD" ? " reaction-current" : ""}`}
          onClick={() => handleLike("SAD")}>
          <span className="legend-reaction">{t("feed.reaction.sad")}</span>
        </div>
        <div
          key="ANGRY"
          className={`reaction-angry${like === "ANGRY" ? " reaction-current" : ""}`}
          onClick={() => handleLike("ANGRY")}>
          <span className="legend-reaction">{t("feed.reaction.angry")}</span>
        </div>
      </div>
    );
  };
  // Icon for a reaction type (used by the Like button + the float effect).
  const reactionIconFor = (type: string) => {
    switch (type) {
      case "LIKE":
        return <AiOutlineLike className="text-2xl text-accent-bright" />;
      case "LOVE":
        return <BsHeart className="text-2xl text-danger" />;
      case "HAHA":
        return <CgSmileMouthOpen className="text-2xl text-warning" />;
      case "SAD":
        return <TbMoodCry className="text-2xl text-warning" />;
      case "WOW":
        return <FaRegSurprise className="text-2xl text-warning" />;
      case "ANGRY":
        return <BsEmojiAngry className="text-2xl text-warning" />;
      default:
        return null;
    }
  };

  const renderLike = () => {
    const types = ["LIKE", "LOVE", "HAHA", "SAD", "WOW", "ANGRY"];
    const current = types.find((type) => type === like);
    const icon = current ? (
      reactionIconFor(current)
    ) : (
      <span>Like</span>
    );
    return (
      <button>
        {renderHover()}
        {/* Keyed by the burst counter so the pop restarts on a fast re-pick.
            The span wraps only the icon (a sibling of the picker), never the
            picker itself, so the pop never resets the picker checkbox. */}
        <span key={burst?.n ?? 0} className={burst ? "like-pop" : ""}>
          {icon}
        </span>
      </button>
    );
  };
  return (
    <span
      className={`like-action p-1 pt-2 pb-0 px-1.5 text-muted`}>
      {renderLike()}
      {burst && (
        <span key={burst.n} className="like-float">
          {reactionIconFor(burst.type)}
        </span>
      )}
    </span>
  );
};

export default Like;
