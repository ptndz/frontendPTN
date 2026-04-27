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
        images
        user {
          id
          avatar
          username
          fullName
        }
        likes {
          id
          reactions
          user {
            id
            avatar
            username
            fullName
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
          }
          likes {
            id
            user {
              id
              username
              fullName
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
        images
        user {
          id
          avatar
          username
          fullName
        }
        likes {
          id
          reactions
          user {
            id
            avatar
            username
            fullName
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
          }
          likes {
            id
            user {
              id
              username
              fullName
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
        images
        user {
          id
          avatar
          username
          fullName
        }
        likes {
          id
          reactions
          user {
            id
            avatar
            username
            fullName
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
export const mutationCommentPost = graphql(`
  mutation commentPost($postUuid: String!, $content: String!) {
    commentPost(postUuid: $postUuid, content: $content) {
      code
      success
      message
      comment {
        id
        user {
          id
          username
          fullName
          avatar
        }
        content
        likes {
          id
          reactions
          user {
            id
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
          id
          username
          fullName
          avatar
        }
        likes {
          id
          user {
            id
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

export const mutationLikePost = graphql(`
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

export const mutationDeletePost = graphql(`
  mutation deletePost($uuid: String!) {
    deletePost(uuid: $uuid) {
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
`);

export const queryCreateBookmark = graphql(`
  query createBookmark($postUuid: String!) {
    createBookmark(postUuid: $postUuid) {
      code
      success
      bookmarks {
        user {
          username
          fullName
          avatar
        }
        post {
          uuid
          content
          createAt
          updateAt
          shares
          images
          user {
            username
            fullName
          }
          likes {
            id
            reactions
          }
          comments {
            id
            content
            likes {
              id
              reactions
            }
            user {
              id
              username
              avatar
              fullName
            }
          }
        }
      }
    }
  }
`);

export const mutationCreatePost = graphql(`
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
`);

export const mutationLikeComment = graphql(`
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

export const mutationCommentComment = graphql(`
  mutation commentComment($commentId: Float!, $content: String!) {
    commentComment(commentId: $commentId, content: $content) {
      code
      success
      message
      comment {
        id
        user {
          id
          username
          fullName
          avatar
        }
        content
        likes {
          id
          reactions
          user {
            id
            username
            fullName
            avatar
          }
        }
      }
    }
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
          }
        }
        user {
          id
          username
          avatar
          fullName
        }
      }
    }
  }
`);
