import { graphql } from "../gql";

export const queryPosts = graphql(`
  query posts {
    posts {
      code
      success
      message
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
export const queryGetPostsUserByUserName = graphql(`
  query getPostsUserByUserName($username: String!) {
    getPostsUserByUserName(username: $username) {
      code
      success
      message
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
