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
