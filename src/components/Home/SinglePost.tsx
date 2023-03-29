import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import moment from "moment";
import { FaArrowUp } from "react-icons/fa";
import { FiTrash } from "react-icons/fi";
import { BiShare } from "react-icons/bi";
import jsonP from "@ptndev/json";
import Comments from "./Comments";
import Link from "next/link";
import {
  BsChatLeft,
  BsBookmark,
  BsBookmarkX,
  BsThreeDotsVertical,
  BsHeartFill,
  BsHeart,
} from "react-icons/bs";
import { toast } from "react-toastify";
import { IComment, IPost } from "../../gql/graphql";
import { useStoreUser } from "../../store/user";
import { graphql } from "../../gql";
import { graphQLClient } from "../../plugins/graphql.plugin";

interface IProps {
  post: IPost;

  setController: any;

  setDeletePost: any;
  bookmarkedPostsId: any;
  deletePost: any;
  isBookmarkPage: any;
  loading: any;
  setRemovedBookmarked: any;
}

const SinglePost: React.FC<IProps> = ({
  post,

  setController,

  setDeletePost,
  bookmarkedPostsId,
  deletePost,
  isBookmarkPage,
  loading,
  setRemovedBookmarked,
}) => {
  const [alreadyBookmarked, setAlreadyBookmarked] = useState(
    bookmarkedPostsId?.some((p: string) => p === post.uuid)
  );
  const [isLike, setIsLike] = useState<boolean>(false);
  const [isSeeMore, setIsSeeMore] = useState<boolean>(false);
  const [dbComments, setDbComments] = useState<IComment[]>([]);
  const [comment, setComment] = useState("");

  const [status, setStatus] = useState("");
  const [menu, setMenu] = useState("hidden");
  const ref = useRef<HTMLInputElement>(null);
  const { user } = useStoreUser();
  useEffect(() => {
    const isLikePost = post?.likes?.find(
      (item) => item.user.username === user.username
    );
    setIsLike(isLikePost ? true : false);
  }, [post, user.username]);

  useEffect(() => {
    if (post.comments) {
      setDbComments(post.comments);
    }
  }, [post.comments]);

  useEffect(() => {
    if (post.content.split("\n").length >= 6) {
      setIsSeeMore(false);
    }
  }, [post.content]);

  const handleSubmitComment = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (comment.length < 1) {
      toast.error("Comment is required");
      return;
    }

    const queryCommentPost = graphql(`
      mutation commentPost($postUuid: String!, $content: String!) {
        commentPost(postUuid: $postUuid, content: $content) {
          code
          success
          message
          comment {
            id
            user {
              username
              fullName
              avatar
            }
            content
            likes {
              id
              reactions
              user {
                username
                fullName
                avatar
              }
            }
          }
          comments {
            id
            content
            user {
              username
              fullName
              avatar
            }
            likes {
              id
              user {
                username
                fullName
                avatar
              }
              reactions
            }
          }
        }
      }
    `);
    const res = await graphQLClient.request(queryCommentPost, {
      postUuid: post.uuid,
      content: comment,
    });
    if (res.commentPost.code === 200) {
      if (res.commentPost.comments) {
        setDbComments(res.commentPost.comments);
      }
      if (ref.current?.value) {
        ref.current.value = "";
        setComment("");
      }
    }
  };

  const handleLike = async () => {
    const queryLike = graphql(`
      mutation likePost($postUuid: String!, $typeReact: String!) {
        likePost(postUuid: $postUuid, typeReact: $typeReact) {
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
      postUuid: post.uuid,
      typeReact: "LIKE",
    });
    if (res.likePost.code === 200) {
      setIsLike(!isLike);
    }
  };
  const handleDelete = (id: any) => {};

  const handleBookmark = async () => {
    try {
    } catch (error) {
      toast.error("");
    }
  };

  const handleBookmarkRemove = async () => {
    try {
    } catch (error) {
      toast.error("");
    }
  };

  return (
    <div className="drop-shadow-sm bg-white dark:bg-black p-5 sm:rounded-xl my-4 ">
      <div className="flex justify-between relative">
        <div className=" flex">
          <Link href={`/${post.user.username}`} passHref>
            <div className="relative">
              <Image
                src={
                  "https://i.ibb.co/MVbC3v6/114-1149878-setting-user-avatar-in-specific-size-w.png"
                }
                className="rounded-full cursor-pointer"
                alt={post.user.fullName}
                height={45}
                width={45}
              />
              <div className="absolute w-3 h-3 rounded-full bg-zinc-600 ring-2 ring-white dark:ring-black bottom-1 right-0"></div>
            </div>
          </Link>
          <div className="ml-3">
            <Link href={`/${post.user.username}`} passHref>
              <h4 className="text-md font-semibold cursor-pointer">
                {post.user.fullName}
              </h4>
            </Link>
            <span className="text-xs">{moment(post.createAt).fromNow()} </span>
          </div>
        </div>
        <div onClick={() => setMenu(menu === "hidden" ? "block" : "hidden")}>
          <div className="p-3 bg-gray-100 dark:bg-zinc-900 rounded-full cursor-pointer">
            <BsThreeDotsVertical className="dark:text-white text-black" />
          </div>
        </div>
      </div>
      <div className={menu}>
        <div className="absolute right-5 py-3 bg-gray-100 dark:bg-zinc-800 w-40 z-40 rounded-lg">
          <ul>
            {alreadyBookmarked ? (
              <li
                onClick={() => {
                  handleBookmarkRemove();
                  setMenu("hidden");
                }}
                className="py-1 flex items-center cursor-pointer hover:bg-white dark:hover:bg-zinc-600 px-3">
                <BsBookmarkX className="mr-2" />
                Remove
              </li>
            ) : (
              <li
                onClick={() => {
                  handleBookmark();
                  setMenu("hidden");
                }}
                className="py-1 flex items-center cursor-pointer hover:bg-white dark:hover:bg-zinc-600 px-3">
                <BsBookmark className="mr-2" /> Bookmark post
              </li>
            )}
            {/* {userData.email && !isBookmarkPage && (
              <li
                className="py-1 flex items-center cursor-pointer hover:bg-white  dark:hover:bg-zinc-600 px-3"
                onClick={() => {
                  handleDelete(post.uuid);
                  setMenu("hidden");
                }}>
                <FiTrash className="mr-2" /> Delete posts
              </li>
            )} */}
          </ul>
        </div>
      </div>
      <div className="pt-3 mb-3">
        {isSeeMore
          ? post.content.split("\n").map(function (item, idx) {
              return (
                <p key={idx}>
                  {item}
                  <br />
                </p>
              );
            })
          : post.content.split("\n").map(function (item, idx) {
              if (idx <= 5) {
                return (
                  <p key={idx}>
                    {item}
                    <br />
                  </p>
                );
              }
            })}

        {post.content.split("\n").length >= 6 && (
          <button
            onClick={() => setIsSeeMore(!isSeeMore)}
            className="text-blue-600 pl-2">
            see more
          </button>
        )}
      </div>
      {post.images
        ? post.images.map((image: string, index: number) => (
            <div
              key={index}
              className="pt-3 relative h-96 rounded-lg overflow-hidden w-full">
              <Image src={image} layout="fill" objectFit="cover" alt="" />
            </div>
          ))
        : ""}
      <div className="flex justify-between items-center">
        <div className="pt-3 flex items-center">
          <div className="box pt-2 pb-0 px-1.5">
            <input type="checkbox" id="like" className="field-reactions" />
            <label htmlFor="like" className="label-reactions">
              Like
            </label>
            <span className="text-desc">
              Press space and after tab key to navigation
            </span>
            <div className="toolbox" />
            <label className="overlay" htmlFor="like" />
            <button className="reaction-like">
              <span className="legend-reaction">Like</span>
            </button>
            <button className="reaction-love">
              <span className="legend-reaction">Love</span>
            </button>
            <button className="reaction-haha">
              <span className="legend-reaction">Haha</span>
            </button>
            <button className="reaction-wow">
              <span className="legend-reaction">Wow</span>
            </button>
            <button className="reaction-sad">
              <span className="legend-reaction">Sad</span>
            </button>
            <button className="reaction-angry">
              <span className="legend-reaction">Angry</span>
            </button>
          </div>
          <span className="p-1 pt-2 pb-0 px-1.5">
            {isLike ? (
              <button onClick={handleLike}>
                <BsHeartFill className="text-xl text-red-500" />
              </button>
            ) : (
              <button onClick={handleLike}>
                <BsHeart className="text-xl" />
              </button>
            )}
          </span>

          <span className="ml-3">{post?.likes?.length}</span>
          <div className="ml-5 ">
            <button className="items-center flex gap-1">
              <BsChatLeft className="text-xl mt-1" />
              <span className="ml-1">{post.comments?.length} Comments</span>
            </button>
          </div>
        </div>
        <div>
          <button className="flex items-center">
            <BiShare className="text-xl" />
            <span className="ml-1">{post.shares} Share</span>
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmitComment}>
        <div className="flex gap-2 items-center pt-5">
          <div className="relative">
            <Image
              src={user.avatar || "/user-8.png"}
              alt=""
              height="50"
              width="50"
              className="rounded-full"
            />
          </div>
          <div className="w-full">
            <input
              onChange={(e) => setComment(e.target.value)}
              ref={ref}
              className="w-full h-10 dark:bg-zinc-800 bg-gray-200 rounded-full p-2 resize-none scrollbar-hide"
              placeholder="Wright a comment ..."
            />
          </div>
          <div className="w-10 flex  items-center justify-center p-3 rounded-full bg-blue-600">
            <button
              disabled={!comment.trim()}
              type="submit"
              className="disabled:cursor-not-allowed">
              <FaArrowUp className=" text-white" />
            </button>
          </div>
        </div>
      </form>
      {dbComments?.map((comment, index) => (
        <Comments key={index} comment={comment} />
      ))}
    </div>
  );
};

export default SinglePost;
