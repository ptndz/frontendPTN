import { getCookies } from "cookies-next";
import { IPost } from "../../gql/graphql";
import { GetServerSideProps } from "next";
import { graphQLServer } from "../../plugins/graphql.plugin";
import { queryPostByUuid } from "../../graphql/post";
import Navigation from "../../components/Share/Navigation";
import SinglePost from "../../components/Home/SinglePost";
import { useState } from "react";

interface IProps {
  postData: IPost;
}

const Post: React.FC<IProps> = ({ postData }) => {
  const [deletePost, setDeletePost] = useState<boolean>(false);
  return (
    <>
      <Navigation />
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
};
export default Post;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { uuid } = context.query;
  try {
    const cookie = getCookies({ req: context.req });
    const accessToken = cookie[process.env.NEXT_PUBLIC_COOKIE_NAME as string];
    if (accessToken) {
      const res = await graphQLServer(
        context.req.headers.cookie,
        accessToken
      ).request(queryPostByUuid, {
        uuid: uuid as string,
      });
      return {
        props: {
          postData: res.post?.post,
        },
      };
    }
    return {
      props: {},
    };
  } catch (error) {
    return {
      props: {},
    };
  }
};
