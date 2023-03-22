import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IComments } from "../../types/comments";
import { User } from "../../gql/graphql";

interface IProps {
  comment: IComments;
}

const Comments: React.FC<IProps> = ({ comment }) => {
  const [user, setUser] = useState<User>();
  useEffect(() => {
    if (comment.userId) {
      axios
        .get(`/api/user/singleUser?id=${comment.userId}`)
        .then(({ data }) => {
          setUser(data);
        });
    }
  }, [comment.userId]);
  return (
    <div className="flex pt-3">
      <div className="">
        <Link href={`/${user?.username}`} passHref>
          <Image
            className="rounded-full cursor-pointer"
            src={
              comment?.avatar ||
              "https://i.ibb.co/MVbC3v6/114-1149878-setting-user-avatar-in-specific-size-w.png"
            }
            alt=""
            height={32}
            width={32}
          />
        </Link>
      </div>
      <div className="dark:bg-zinc-800 bg-slate-200 px-3 py-2 rounded-2xl ml-2">
        <Link href={`/${user?.username}`} passHref>
          <h1 className="text-sm font-semibold cursor-pointer">
            {comment.fullName}
          </h1>
        </Link>
        <p className="text-sm">{comment.comment}</p>
      </div>
    </div>
  );
};

export default Comments;
