import React, { useEffect, useRef, useState, useId } from "react";
import Image from "next/image";
import moment from "moment";
import { FaArrowUp, FaRegSurprise } from "react-icons/fa";
import { FiTrash, FiBookOpen, FiMoreHorizontal } from "react-icons/fi";
import { BiShare } from "react-icons/bi";
import { AiOutlineLike } from "react-icons/ai";
import { TbMoodCry } from "react-icons/tb";
import CommentThread from "./CommentThread";
import Link from "next/link";
import {
  BsChatLeft,
  BsBookmark,
  BsBookmarkX,
  BsHeart,
  BsEmojiAngry,
  BsHeartFill,
} from "react-icons/bs";
import { MdBugReport } from "react-icons/md";
import { toast } from "react-toastify";
import { IComment, IPost } from "../../gql/graphql";
import { useStoreUser } from "../../store/user";
import {
  mutationCommentPost,
  mutationLikePost,
  mutationDeletePost,
  queryCreateBookmark,
} from "../../graphql/post";
import { graphQLClient, graphQLClientErrorCheck } from "../../plugins/graphql.plugin";
import { CgSmileMouthOpen } from "react-icons/cg";
import Carousel from "./Carousel";
import axios from "axios";

interface IProps {
  post: IPost;
  setDeletePost: (deletePost: boolean) => void;
  bookmarkedPostsId: string[];
  deletePost: boolean;
  isBookmarkPage: boolean;
  loading: boolean;
}

const SinglePost: React.FC<IProps> = ({
  post, setDeletePost, bookmarkedPostsId, deletePost, isBookmarkPage, loading,
}) => {
  const [alreadyBookmarked, setAlreadyBookmarked] = useState(
    bookmarkedPostsId?.some((p: string) => p === post.uuid)
  );
  const [like, setLike] = useState<string>("");
  const [isSeeMore, setIsSeeMore] = useState<boolean>(false);
  const [dbComments, setDbComments] = useState<IComment[]>([]);
  const [comment, setComment] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const idLike = useId();
  const { user } = useStoreUser();

  useEffect(() => {
    const isLikePost = post?.likes?.find((item) => item.user.username === user.username);
    setLike(isLikePost ? isLikePost.reactions : "");
  }, [post, user.username]);

  useEffect(() => {
    if (post.comments) setDbComments(post.comments);
  }, [post.comments]);

  useEffect(() => {
    if (post.content.split("\n").length >= 6) setIsSeeMore(false);
  }, [post.content]);

  const handleSubmitComment = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (comment.length < 1) { toast.error("Comment is required"); return; }
    const res = await graphQLClient.request(mutationCommentPost, {
      postUuid: post.uuid, content: comment,
    });
    if (graphQLClientErrorCheck(res)) {
      if (res.commentPost.comments) setDbComments(res.commentPost.comments);
      if (ref.current) { ref.current.value = ""; setComment(""); }
    }
  };

  const handleLike = async (typeReact: string) => {
    try {
      const res = await graphQLClient.request(mutationLikePost, {
        postUuid: post.uuid, typeReact,
      });
      if (graphQLClientErrorCheck(res) && res.likePost.like) {
        setLike(res.likePost.like.reactions);
      }
    } catch (error) { console.log(error); }
  };

  const handleDelete = async (uuid: string) => {
    const res = await graphQLClient.request(mutationDeletePost, { uuid });
    if (graphQLClientErrorCheck(res)) setDeletePost(!deletePost);
  };

  const handleBookmark = async (uuid: string) => {
    try {
      const res = await graphQLClient.request(queryCreateBookmark, { postUuid: uuid });
      if (graphQLClientErrorCheck(res)) setAlreadyBookmarked(true);
    } catch (error) { toast.error(uuid); }
  };

  const handleBookmarkRemove = () => setAlreadyBookmarked(false);
  const handleReport = async (uuid: string) => {
    await axios.post(`/bookmark/report/${uuid}`);
    toast.error("Reported");
  };

  const reactionMap: Record<string, React.ReactNode> = {
    LIKE: <AiOutlineLike className="text-sky-500" />,
    LOVE: <BsHeartFill className="text-red-500" />,
    HAHA: <CgSmileMouthOpen className="text-yellow-400" />,
    SAD: <TbMoodCry className="text-yellow-400" />,
    WOW: <FaRegSurprise className="text-yellow-400" />,
    ANGRY: <BsEmojiAngry className="text-orange-500" />,
  };

  const renderLikeIcon = () => (
    <span className="text-xl">
      {reactionMap[like] ?? <BsHeart />}
    </span>
  );

  const contentLines = post.content.split("\n");
  const isLong = contentLines.length >= 6;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 my-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center gap-3">
          <Link href={`/${post.user.username}`}>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer">
              <Image
                src={post.user.avatar || "/images/user-avatar.png"}
                alt={post.user.fullName}
                fill
                className="object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-gray-900 rounded-full" />
            </div>
          </Link>
          <div>
            <Link href={`/${post.user.username}`}>
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
                {post.user.fullName}
              </p>
            </Link>
            <p className="text-xs text-gray-400">{moment(post.createAt).fromNow()}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiMoreHorizontal />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 w-44 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 z-40 overflow-hidden py-1">
              {alreadyBookmarked ? (
                <button
                  onClick={() => { handleBookmarkRemove(); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <BsBookmarkX className="text-gray-400" /> Remove bookmark
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { handleBookmark(post.uuid); setMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <BsBookmark className="text-gray-400" /> Bookmark
                  </button>
                  <button
                    onClick={() => { handleReport(post.uuid); setMenuOpen(false); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <MdBugReport className="text-gray-400" /> Report
                  </button>
                </>
              )}
              {user.username === post.user.username && (
                <button
                  onClick={() => { handleDelete(post.uuid); setMenuOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <FiTrash /> Delete
                </button>
              )}
              <Link href={`/post/${post.uuid}`}>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <FiBookOpen className="text-gray-400" /> Open post
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <div className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed space-y-1">
          {(isLong && !isSeeMore ? contentLines.slice(0, 5) : contentLines).map((line, idx) => (
            <p key={idx}>{line || <br />}</p>
          ))}
        </div>
        {isLong && (
          <button
            onClick={() => setIsSeeMore(!isSeeMore)}
            className="mt-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            {isSeeMore ? "See less" : "See more"}
          </button>
        )}
      </div>

      {/* Images */}
      {post.images && <Carousel images={post.images} />}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1">
          {/* Like with reaction picker */}
          <div className="box relative">
            <input type="checkbox" id={idLike} className="field-reactions" />
            <label htmlFor={idLike} className="label-reactions">Like</label>
            <span className="text-desc">Press space and after tab key to navigation</span>
            <div className="toolbox" />
            <label className="overlay" htmlFor={idLike} />
            <button className="reaction-like" onClick={() => handleLike("LIKE")}><span className="legend-reaction">Like</span></button>
            <button className="reaction-love" onClick={() => handleLike("LOVE")}><span className="legend-reaction">Love</span></button>
            <button className="reaction-haha" onClick={() => handleLike("HAHA")}><span className="legend-reaction">Haha</span></button>
            <button className="reaction-wow" onClick={() => handleLike("WOW")}><span className="legend-reaction">Wow</span></button>
            <button className="reaction-sad" onClick={() => handleLike("SAD")}><span className="legend-reaction">Sad</span></button>
            <button className="reaction-angry" onClick={() => handleLike("ANGRY")}><span className="legend-reaction">Angry</span></button>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {renderLikeIcon()}
            <span>{post?.likes?.length || 0}</span>
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <BsChatLeft className="text-base" />
            <span>{post.comments?.length || 0}</span>
          </button>
        </div>

        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <BiShare className="text-base" />
          <span>{post.shares || 0}</span>
        </button>
      </div>

      {/* Comment input */}
      <form onSubmit={handleSubmitComment} className="flex items-center gap-2.5 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <div className="relative w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
          <Image src={user.avatar || "/images/user-avatar.png"} alt={user.fullName} fill className="object-cover" />
        </div>
        <input
          onChange={(e) => setComment(e.target.value)}
          ref={ref}
          className="flex-1 h-9 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 border border-transparent focus:border-emerald-200 dark:focus:border-emerald-800 transition-all"
          placeholder="Write a comment..."
        />
        <button
          type="submit"
          disabled={!comment.trim()}
          className="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
        >
          <FaArrowUp className="text-sm" />
        </button>
      </form>

      {/* Comments */}
      {dbComments.length > 0 && (
        <div className="px-4 pb-4 space-y-1 border-t border-gray-100 dark:border-gray-800 pt-2">
          {[...dbComments].reverse().map((c) => (
            <CommentThread key={c.id} comment={c} isRoot />
          ))}
        </div>
      )}
    </div>
  );
};

export default SinglePost;
