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
        statusEmail
        verified
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
        statusEmail
        verified
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
export const queryGetUserByUuid = graphql(`
  query getUserByUuid($userUuid: String!) {
    getUserByUuid(userUuid: $userUuid) {
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
        statusEmail
        verified
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
      refreshToken
      requiresTwoFactor
      twoFactorToken
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
        statusEmail
        verified
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
      refreshToken
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
        statusEmail
        verified
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
/**
 * P3.3 — bước 2 đăng nhập. Raw string (không qua graphql() codegen) để
 * khỏi phải regenerate bảng documents — xem ghi chú P1 ở post.ts.
 */
export const QUERY_VERIFY_TWO_FACTOR_LOGIN = `
  mutation verifyTwoFactorLogin($token: String!, $code: String!) {
    verifyTwoFactorLogin(token: $token, code: $code) {
      code
      success
      message
      accessToken
      refreshToken
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
        statusEmail
        verified
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
`;
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
export const queryProfile = graphql(`
  query profile {
    profile {
      profile {
        id
        city
        education
        relationship
        from
        workplace
        updateAt
      }
    }
  }
`);
export const queryProfileByUser = graphql(`
  query profileByUser($username: String!) {
    profileByUser(username: $username) {
      profile {
        id
        city
        education
        relationship
        from
        workplace
        updateAt
      }
    }
  }
`);
export const queryUpdateProfile = graphql(`
  mutation updateProfile(
    $city: String!
    $education: String!
    $relationship: String!
    $from: String!
    $workplace: String!
  ) {
    updateProfile(
      profileInput: {
        city: $city
        education: $education
        relationship: $relationship
        from: $from
        workplace: $workplace
      }
    ) {
      code
      success
      message
      errors {
        message
        field
      }
      profile {
        id
        city
        education
        relationship
        from
        workplace
        updateAt
      }
    }
  }
`);
export const queryUpdateUser = graphql(`
  mutation updateUser(
    $firstName: String!
    $lastName: String!
    $fullName: String!
    $avatar: String!
    $coverImage: String!
  ) {
    updateUser(
      updateUserInput: {
        firstName: $firstName
        lastName: $lastName
        avatar: $avatar
        coverImage: $coverImage
        fullName: $fullName
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
        statusEmail
        verified
      }
      errors {
        message
        field
      }
    }
  }
`);
