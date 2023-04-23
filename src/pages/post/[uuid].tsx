import { IPost } from "../../gql/graphql";
import { GetStaticPaths, GetStaticProps } from "next";
import { graphQLClient, graphQLServer } from "../../plugins/graphql.plugin";
import { queryGetAllPostIds, queryPostByUuid } from "../../graphql/post";
import Navigation from "../../components/Share/Navigation";
import SinglePost from "../../components/Home/SinglePost";
import { useEffect, useState } from "react";
import Error from "../404";
import { queryUser } from "../../graphql/user";
import { useStoreUser } from "../../store/user";
import { NextSeo } from "next-seo";
interface IProps {
  postData: IPost;
}

const Post: React.FC<IProps> = ({ postData }) => {
  const [deletePost, setDeletePost] = useState<boolean>(false);
  const { user, setUser } = useStoreUser();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await graphQLClient.request(queryUser);
      if (res.user.user) {
        setUser(res.user.user);
      }
    };
    fetchUser();
  }, [setUser]);

  if (postData) {
    return (
      <>
        <NextSeo
          title={postData.content}
          description={postData.content}
          canonical={`${process.env.NEXT_PUBLIC_URL_APP}/post/${postData.uuid}`}
          openGraph={{
            url: `${process.env.NEXT_PUBLIC_URL_APP}/post/${postData.uuid}`,
            title: postData.content,
            description: postData.content,
            images: postData.images?.map((image) => ({
              url: image,
            })),
            siteName: "SiteName",
          }}
          twitter={{
            handle: "@handle",
            site: "@site",
            cardType: "summary_large_image",
          }}
        />
        {user.id !== "" ? <Navigation /> : null}
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

export const getStaticPaths: GetStaticPaths = async () => {
  const postsId = await graphQLServer("", "").request(queryGetAllPostIds);
  const paths = postsId.getAllPostIds.map((id) => ({
    params: {
      uuid: id,
    },
  }));

  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const res = await graphQLServer("", "").request(queryPostByUuid, {
    uuid: params?.uuid as string,
  });

  return {
    props: {
      postData: res.post?.post,
    },
    revalidate: 10,
  };
};
