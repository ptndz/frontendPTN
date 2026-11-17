import { graphql } from "../gql";

export const queryPosts = graphql(`
  query posts($page: Float!, $limit: Float!) {
    posts(page: $page, limit: $limit) {
      code
      success
      message
      page
      limit
      posts {
        uuid
        content
        createAt
        updateAt
        shares
        likesCount
        commentsCount
        images
        user {
          id
          avatar
          username
          fullName
          verified
        }
        likes {
          id
          reactions
          user {
            id
            avatar
            username
            fullName
          verified
          }
        }
        comments {
          id
          content
          user {
            id
            avatar
            username
            fullName
          verified
          }
          likes {
            id
            user {
              id
              username
              fullName
          verified
              avatar
            }
            reactions
          }
        }
      }
    }
  }
`);
export const queryPostByUuid = graphql(`
  query post($uuid: String!) {
    post(uuid: $uuid) {
      code
      success
      message
      post {
        uuid
        content
        createAt
        updateAt
        shares
        likesCount
        commentsCount
        images
        user {
          id
          avatar
          username
          fullName
          verified
        }
        likes {
          id
          reactions
          user {
            id
            avatar
            username
            fullName
          verified
          }
        }
        comments {
          id
          content
          user {
            id
            avatar
            username
            fullName
          verified
          }
          likes {
            id
            user {
              id
              username
              fullName
          verified
              avatar
            }
            reactions
          }
        }
      }
    }
  }
`);
export const queryGetPostsUserByUserName = graphql(`
  query getPostsUserByUserName(
    $username: String!
    $page: Float!
    $limit: Float!
  ) {
    getPostsUserByUserName(username: $username, page: $page, limit: $limit) {
      code
      success
      message
      page
      limit
      posts {
        uuid
        content
        createAt
        updateAt
        shares
        likesCount
        commentsCount
        images
        user {
          id
          avatar
          username
          fullName
          verified
        }
        likes {
          id
          reactions
          user {
            id
            avatar
            username
            fullName
          verified
          }
        }
        comments {
          id
          content
          user {
            id
            avatar
            username
            fullName
          verified
          }
        }
      }
    }
  }
`);

export const queryGetAllPostIds = graphql(`
  query getAllPostIds {
    getAllPostIds
  }
`);
export const queryCommentByCommentId = graphql(`
  query getCommentComment($commentId: Float!) {
    getCommentComment(commentId: $commentId) {
      code
      comments {
        id
        content
        likes {
          id
          reactions
          user {
            id
            username
            avatar
            fullName
          verified
          }
        }
        user {
          id
          username
          avatar
          fullName
          verified
        }
      }
    }
  }
`);

/* ------------------------------------------------------------------ P1 ----
 * Raw-string GraphQL cho các field P1 (poll / audience / groupId).
 *
 * Vì sao không dùng graphql() codegen ở đây: graphql() tra chuỗi query
 * trong bảng documents đã generate — chuỗi mới không có trong bảng sẽ
 * trả về {} lúc runtime (xem src/gql/gql.ts: `?? {}`), query gửi đi sẽ
 * rỗng. Raw string gửi thẳng qua graphql-request thì không bị vậy.
 * Codegen chỉ chạy lại được khi có schema backend mới; tới lúc đó có thể
 * regenerate và thay các raw string này bằng document codegen.
 *
 * Fallback: backend P1 đang xây song song — nếu server chưa có field
 * poll/audience (lỗi unknown field) thì các helper dưới tự rơi về query
 * / mutation cũ để feed không gãy; bài viết vẫn hiện, chỉ thiếu poll.
 * ------------------------------------------------------------------ */

import { graphQLClient } from "../plugins/graphql.plugin";
import type { PostWithExtras } from "../types/social";

/** Một trang kết quả bài viết (feed / profile / nhóm). */
export interface PostsPage {
  code?: number;
  success?: boolean;
  message?: string | null;
  page?: number | null;
  limit?: number | null;
  posts?: PostWithExtras[] | null;
}

const POLL_SELECTION = `
  poll {
    id
    question
    options {
      id
      text
      voteCount
    }
    totalVotes
    userVotedOptionIds
  }
`;

const POST_CORE_FIELDS = `
  uuid
  content
  createAt
  updateAt
  shares
  likesCount
  commentsCount
  images
  audience
  ${POLL_SELECTION}
  user {
    id
    avatar
    username
    fullName
    verified
  }
  likes {
    id
    reactions
    user {
      id
      avatar
      username
      fullName
      verified
    }
  }
  comments {
    id
    content
    user {
      id
      avatar
      username
      fullName
      verified
    }
    likes {
      id
      user {
        id
        username
        fullName
        avatar
        verified
      }
      reactions
    }
  }
`;

export const QUERY_POSTS_EXTRAS = `
  query postsWithExtras($page: Float!, $limit: Float!) {
    posts(page: $page, limit: $limit) {
      code
      success
      message
      page
      limit
      posts {
        ${POST_CORE_FIELDS}
      }
    }
  }
`;

export const QUERY_POST_EXTRAS = `
  query postWithExtras($uuid: String!) {
    post(uuid: $uuid) {
      code
      success
      message
      post {
        ${POST_CORE_FIELDS}
      }
    }
  }
`;

export const QUERY_USER_POSTS_EXTRAS = `
  query getPostsUserByUserNameWithExtras(
    $username: String!
    $page: Float!
    $limit: Float!
  ) {
    getPostsUserByUserName(username: $username, page: $page, limit: $limit) {
      code
      success
      message
      page
      limit
      posts {
        ${POST_CORE_FIELDS}
      }
    }
  }
`;

export const MUTATION_CREATE_POST_EXTRAS = `
  mutation createPostWithExtras(
    $content: String!
    $images: [String!]!
    $audience: String
    $groupId: String
    $poll: PollInput
  ) {
    createPost(
      createPostInput: {
        content: $content
        images: $images
        audience: $audience
        groupId: $groupId
        poll: $poll
      }
    ) {
      code
      success
      message
      post {
        uuid
        content
        createAt
        updateAt
        images
        audience
      }
      errors {
        field
        message
      }
    }
  }
`;

export const MUTATION_UPDATE_POST_EXTRAS = `
  mutation updatePostWithExtras(
    $uuid: String!
    $content: String
    $images: [String!]
    $audience: String
  ) {
    updatePost(
      updatePostInput: {
        uuid: $uuid
        content: $content
        images: $images
        audience: $audience
      }
    ) {
      code
      success
      message
      post {
        uuid
        content
        createAt
        updateAt
        images
        audience
      }
      errors {
        field
        message
      }
    }
  }
`;

/** Lỗi "field chưa tồn tại" của backend cũ — dấu hiệu để fallback. */
function isUnknownFieldError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error ?? "");
  return /unknown (field|argument)|cannot query field|did you mean|field .* doesn't exist|unknown type/i.test(
    message
  );
}

export interface CreatePostExtrasInput {
  content: string;
  images: string[];
  audience?: string;
  groupId?: string;
  poll?: { question: string; options: string[]; multiple?: boolean } | null;
}

/** Feed: thử query có poll/audience, lỗi thì về query codegen cũ. */
export async function fetchPostsPage(
  page: number,
  limit: number
): Promise<PostsPage> {
  try {
    const res = await graphQLClient.request<any>(QUERY_POSTS_EXTRAS, {
      page,
      limit,
    });
    if (res?.posts) return res.posts as PostsPage;
  } catch (error) {
    if (!isUnknownFieldError(error)) {
      // Lỗi khác (vd auth) — vẫn thử query cũ một lần rồi mới throw.
      try {
        const res = await graphQLClient.request(queryPosts, { page, limit });
        return res.posts as PostsPage;
      } catch {
        throw error;
      }
    }
  }
  const res = await graphQLClient.request(queryPosts, { page, limit });
  return res.posts as PostsPage;
}

/** Trang chi tiết bài: như trên, fallback về query codegen cũ.
 *  `client` mặc định là graphQLClient (browser); getStaticProps truyền
 *  graphQLServer("", "") vì lúc build không có cookie. */
export async function fetchPostByUuid(
  uuid: string,
  client: typeof graphQLClient = graphQLClient
) {
  try {
    const res = await client.request<any>(QUERY_POST_EXTRAS, { uuid });
    if (res?.post?.post) return res.post.post;
  } catch (error) {
    if (!isUnknownFieldError(error)) throw error;
  }
  const res = await client.request(queryPostByUuid, { uuid });
  return res.post?.post;
}

/** Bài của 1 user (trang profile): như trên. */
export async function fetchUserPostsPage(
  username: string,
  page: number,
  limit: number
): Promise<PostsPage | null | undefined> {
  try {
    const res = await graphQLClient.request<any>(QUERY_USER_POSTS_EXTRAS, {
      username,
      page,
      limit,
    });
    if (res?.getPostsUserByUserName)
      return res.getPostsUserByUserName as PostsPage;
  } catch (error) {
    if (!isUnknownFieldError(error)) throw error;
  }
  const res = await graphQLClient.request(queryGetPostsUserByUserName, {
    username,
    page,
    limit,
  });
  return res.getPostsUserByUserName as PostsPage | null | undefined;
}

/**
 * Tạo bài kèm audience / groupId / poll. Backend cũ chưa có các input
 * mới -> lỗi unknown argument -> retry bằng mutation codegen cũ
 * (chỉ content + images).
 */
export async function createPostWithExtras(input: CreatePostExtrasInput) {
  const variables: Record<string, unknown> = {
    content: input.content,
    images: input.images,
    audience: input.audience ?? "public",
  };
  if (input.groupId) variables.groupId = input.groupId;
  if (input.poll) variables.poll = input.poll;
  try {
    return await graphQLClient.request<any>(
      MUTATION_CREATE_POST_EXTRAS,
      variables
    );
  } catch (error) {
    if (!isUnknownFieldError(error)) throw error;
    // Mutation codegen cũ nằm trong CreatePost.tsx (graphql `createPost`);
    // ở đây gửi lại bằng raw string tương đương để không phụ thuộc component.
    const legacy = `
      mutation createPost($content: String!, $images: [String!]!) {
        createPost(createPostInput: { content: $content, images: $images }) {
          code
          success
          message
          post {
            uuid
            content
            createAt
            updateAt
            images
          }
          errors {
            field
            message
          }
        }
      }
    `;
    return await graphQLClient.request<any>(legacy, {
      content: input.content,
      images: input.images,
    });
  }
}

/**
 * Sửa bài (content / images / audience). Backend cũ -> retry mutation
 * updatePost cũ (uuid + content + images).
 */
export async function updatePostWithExtras(input: {
  uuid: string;
  content?: string;
  images?: string[];
  audience?: string;
}) {
  try {
    return await graphQLClient.request<any>(MUTATION_UPDATE_POST_EXTRAS, {
      uuid: input.uuid,
      content: input.content,
      images: input.images,
      audience: input.audience,
    });
  } catch (error) {
    if (!isUnknownFieldError(error)) throw error;
    const legacy = `
      mutation updatePost($uuid: String!, $content: String!, $images: [String!]) {
        updatePost(
          updatePostInput: { uuid: $uuid, content: $content, images: $images }
        ) {
          code
          success
          message
          post {
            uuid
            content
            createAt
            updateAt
            images
          }
          errors {
            field
            message
          }
        }
      }
    `;
    return await graphQLClient.request<any>(legacy, {
      uuid: input.uuid,
      content: input.content ?? "",
      images: input.images,
    });
  }
}
