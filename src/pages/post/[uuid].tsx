import { IPost } from "../../gql/graphql";
import type { PostWithExtras } from "../../types/social";
import { GetStaticPaths, GetStaticProps } from "next";
import { graphQLClient, graphQLServer } from "../../plugins/graphql.plugin";
import {
  fetchPostByUuid,
  queryGetAllPostIds,
} from "../../graphql/post";
import Navigation from "../../components/Share/Navigation";
import SinglePost from "../../components/Home/SinglePost";
import { useEffect, useState } from "react";
import Error from "../404";
import { queryUser } from "../../graphql/user";
import { useStoreUser } from "../../store/user";
import { ArticleJsonLd } from "next-seo";
import dynamic from "next/dynamic";
import { VStack } from "@astryxdesign/core/VStack";

const DynamicWidgetMessage = dynamic(
  () => import("../../components/Messages/WidgetMessage"),
  {
    ssr: false,
  }
);
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
        <ArticleJsonLd
          type="BlogPosting"
          url={`${process.env.NEXT_PUBLIC_URL_APP}post/${postData.uuid}`}
          headline={postData.content}
          mainEntityOfPage={`${process.env.NEXT_PUBLIC_URL_APP}post/${postData.uuid}`}
          description={postData.content}
          image={postData.images as string[]}
          // W6: createAt/updateAt là Maybe<string> — ArticleJsonLd chỉ
          // nhận string | undefined nên đổi null thành undefined.
          datePublished={postData.createAt ?? undefined}
          dateModified={postData.updateAt ?? undefined}
          author={postData.user.username}
        />
        {user.id !== "" ? <Navigation /> : null}
        <VStack gap={4} className="mx-auto w-full max-w-4xl bg-paper pt-2">
          <SinglePost
            // W6: IPost (schema: mảng/poll nullable) không gán trực tiếp
            // được cho PostWithExtras — cast, không đổi dữ liệu runtime.
            post={postData as PostWithExtras}
            loading={false}
            isBookmarkPage={false}
            deletePost={deletePost}
            setDeletePost={setDeletePost}
            bookmarkedPostsId={[]}
          />
          <DynamicWidgetMessage />
        </VStack>
      </>
    );
  } else {
    return <Error />;
  }
};
export default Post;

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const postsId = await graphQLServer("", "").request(queryGetAllPostIds);
    // W6: getAllPostIds là (string | null)[] — lọc id null (GetStaticPaths
    // không nhận params.uuid null).
    const paths = postsId.getAllPostIds
      .filter((id): id is string => id != null)
      .map((id) => ({
        params: {
          uuid: id,
        },
      }));

    return { paths, fallback: "blocking" };
  } catch (error) {
    // P0.5 — Backend down thì build vẫn pass: không prerender bài nào,
    // trang chi tiết sẽ render on-demand nhờ fallback: "blocking".
    console.warn("getStaticPaths: cannot reach backend, building with no pre-rendered posts:", error);
    return { paths: [], fallback: "blocking" };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // P1 — lấy cả poll/audience, fallback về query cũ nếu backend chưa có.
  const postData = await fetchPostByUuid(
    params?.uuid as string,
    graphQLServer("", "")
  );

  return {
    props: {
      postData: postData ?? null,
    },
    revalidate: 10,
  };
};
