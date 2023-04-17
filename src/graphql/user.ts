import { graphql } from "../gql";
export const queryUser = graphql(`
  query user {
    user {
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
        role
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
export const queryGetUserByUsername = graphql(`
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
        role
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
        role
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
export const queryRegister = graphql(`
  mutation register(
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $username: String!
    $fullName: String!
    $phone: String!
    $birthday: String!
    $sex: Boolean!
    $avatar: String!
    $coverImage: String!
  ) {
    register(
      registerInput: {
        firstName: $firstName
        lastName: $lastName
        email: $email
        password: $password
        username: $username
        fullName: $fullName
        phone: $phone
        birthday: $birthday
        sex: $sex
        avatar: $avatar
        coverImage: $coverImage
      }
    ) {
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
        role
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
export const queryResetPassword = graphql(`
  mutation resetPassword($password: String!, $token: String!) {
    resetPassword(password: $password, token: $token)
  }
`);
export const queryForgotPassword = graphql(`
  query forgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`);
