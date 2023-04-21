import { getCookies } from "cookies-next";
import { IPost, User } from "../../gql/graphql";
import { GetServerSideProps } from "next";
import { graphQLServer } from "../../plugins/graphql.plugin";
import { queryPostByUuid } from "../../graphql/post";
import Navigation from "../../components/Share/Navigation";
import SinglePost from "../../components/Home/SinglePost";
import { useEffect, useState } from "react";
import Error from "../404";
import { queryUser } from "../../graphql/user";
import { useStoreUser } from "../../store/user";
interface IProps {
  postData: IPost;
  userData: User;
}

const Post: React.FC<IProps> = ({ postData, userData }) => {
  const [deletePost, setDeletePost] = useState<boolean>(false);
  const { setUser } = useStoreUser();

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [setUser, userData]);

  if (postData) {
    return (
      <>
        {userData ? <Navigation /> : null}
        <div className="max-w-4xl mx-auto gap-4 bg-gray-100 dark:bg-zinc-900 pt-2 w-full ">
          <SinglePost
            post={postData}
            loading={false}
            isBookmarkPage={false}
            deletePost={deletePost}
            setDeletePost={setDeletePost}
            bookmarkedPostsId={[]}
          />
        </div>
      </>
    );
  } else {
    return <Error />;
  }
};
export default Post;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { uuid } = context.query;
  const cookie = getCookies({ req: context.req });
  const accessToken = cookie[process.env.NEXT_PUBLIC_COOKIE_NAME as string];
  const res = await graphQLServer(
    context.req.headers.cookie,
    accessToken
  ).request(queryPostByUuid, {
    uuid: uuid as string,
  });
  try {
    const resUser = await graphQLServer(
      context.req.headers.cookie,
      accessToken
    ).request(queryUser);
    return {
      props: {
        postData: res.post?.post,
        userData: resUser.user.user,
      },
    };
  } catch (error) {
    return {
      props: {
        postData: res.post?.post,
        userData: null,
      },
    };
  }
};
