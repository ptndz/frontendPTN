import { graphql } from "../gql";

export const queryGetUser = graphql(`
  query getUser($username: String!) {
    getUser(username: $username) {
      code
      success
      message
      user {
        id
        fullName
        lastName
        firstName
        username
        email
        avatar
        coverImage
        phone
        birthday
        sex
        createAt
        updateAt
      }
      errors {
        message
        field
      }
    }
  }
`);
export const queryLogin = graphql(`
  mutation login($email: String!, $password: String!) {
    login(loginInput: { usernameOrEmail: $email, password: $password }) {
      code
      success
      message
      accessToken
      user {
        id
        fullName
        lastName
        firstName
        username
        email
        avatar
        phone
        birthday
        sex
        coverImage
        createAt
        updateAt
      }
      errors {
        message
        field
      }
    }
  }
`);
