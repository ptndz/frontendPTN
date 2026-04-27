import { graphql } from "../gql";

export const queryBookmarkPost = graphql(`
  query bookmarkAll {
    bookmarkAll {
      code
      success
      bookmarks {
        id
        createAt
        user {
          id
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
            id
            username
            avatar
            fullName
          }
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
          comments {
            id
            content
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
