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
