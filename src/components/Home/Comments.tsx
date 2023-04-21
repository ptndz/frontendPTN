import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IComment, User } from "../../gql/graphql";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { queryGetUserByUsername } from "../../graphql/user";

interface IProps {
  comment: IComment;
}

const Comments: React.FC<IProps> = ({ comment }) => {
  const [userData, setUserData] = useState<User>();
  const [like, setLike] = useState<string>("");
  useEffect(() => {
    if (comment.user.username) {
      const fetchData = async () => {
        try {
          const res = await graphQLClient.request(queryGetUserByUsername, {
            username: comment.user.username,
          });

          if (res.getUser.code === 200) {
            if (res.getUser.user) {
              setUserData(res.getUser.user);
            }
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchData();
    }
  }, [comment.user.username]);

  return (
    <div className="flex pt-3">
      <div className="">
        <Link href={`/${userData?.username}`} passHref>
          <Image
            className="rounded-full cursor-pointer"
            src={userData?.avatar || "/images/user-avatar.png"}
            alt=""
            height={32}
            width={32}
          />
        </Link>
      </div>
      <div className="dark:bg-zinc-800 bg-slate-200 px-3 py-2 rounded-2xl ml-2">
        <Link href={`/${userData?.username}`} passHref>
          <h1 className="text-sm font-semibold cursor-pointer">
            {userData?.fullName}
          </h1>
        </Link>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  );
};

export default Comments;
