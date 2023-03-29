/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  "\n    mutation login($email: String!, $password: String!) {\n      login(loginInput: { usernameOrEmail: $email, password: $password }) {\n        code\n        success\n        message\n        accessToken\n        user {\n          id\n          fullName\n          lastName\n          firstName\n          username\n          email\n          avatar\n          phone\n          birthday\n          sex\n          createAt\n          updateAt\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  ":
    types.LoginDocument,
  "\n        query getUser($username: String!) {\n          getUser(username: $username) {\n            code\n            success\n            message\n            user {\n              id\n              fullName\n              lastName\n              firstName\n              username\n              email\n              avatar\n              phone\n              birthday\n              sex\n              createAt\n              updateAt\n            }\n            errors {\n              message\n              field\n            }\n          }\n        }\n      ":
    types.GetUserDocument,
  "\n    mutation createPost($content: String!, $images: [String!]!) {\n      createPost(createPostInput: { content: $content, images: $images }) {\n        code\n        success\n        message\n        post {\n          uuid\n          content\n          createAt\n          updateAt\n          images\n        }\n        errors {\n          field\n          message\n        }\n      }\n    }\n  ":
    types.CreatePostDocument,
  "\n    query posts {\n      posts {\n        code\n        success\n        message\n        posts {\n          uuid\n          content\n          createAt\n          updateAt\n          shares\n          images\n          user {\n            avatar\n            username\n            fullName\n          }\n          likes {\n            id\n            reactions\n            user {\n              avatar\n              username\n              fullName\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              avatar\n              username\n              fullName\n            }\n          }\n        }\n      }\n    }\n  ":
    types.PostsDocument,
  "\n    query getUsers {\n      getUsers {\n        code\n        success\n        message\n        users {\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  ":
    types.GetUsersDocument,
  "\n      mutation commentPost($postUuid: String!, $content: String!) {\n        commentPost(postUuid: $postUuid, content: $content) {\n          code\n          success\n          message\n          comment {\n            id\n            user {\n              username\n              fullName\n              avatar\n            }\n            content\n            likes {\n              id\n              reactions\n              user {\n                username\n                fullName\n                avatar\n              }\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              username\n              fullName\n              avatar\n            }\n            likes {\n              id\n              user {\n                username\n                fullName\n                avatar\n              }\n              reactions\n            }\n          }\n        }\n      }\n    ":
    types.CommentPostDocument,
  "\n      mutation likePost($postUuid: String!, $typeReact: String!) {\n        likePost(postUuid: $postUuid, typeReact: $typeReact) {\n          code\n          success\n          message\n          like {\n            id\n            reactions\n            user {\n              fullName\n              username\n            }\n          }\n        }\n      }\n    ":
    types.LikePostDocument,
  "\n      query getUser($username: String!) {\n        getUser(username: $username) {\n          code\n          success\n          message\n          user {\n            id\n            fullName\n            lastName\n            firstName\n            username\n            email\n            avatar\n            phone\n            birthday\n            sex\n            createAt\n            updateAt\n          }\n          errors {\n            message\n            field\n          }\n        }\n      }\n    ":
    types.GetUserDocument,
  "\n    query user {\n      user {\n        code\n        success\n        message\n        user {\n          id\n          fullName\n          lastName\n          firstName\n          username\n          email\n          avatar\n          phone\n          birthday\n          sex\n          createAt\n          updateAt\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  ":
    types.UserDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    mutation login($email: String!, $password: String!) {\n      login(loginInput: { usernameOrEmail: $email, password: $password }) {\n        code\n        success\n        message\n        accessToken\n        user {\n          id\n          fullName\n          lastName\n          firstName\n          username\n          email\n          avatar\n          phone\n          birthday\n          sex\n          createAt\n          updateAt\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "
): (typeof documents)["\n    mutation login($email: String!, $password: String!) {\n      login(loginInput: { usernameOrEmail: $email, password: $password }) {\n        code\n        success\n        message\n        accessToken\n        user {\n          id\n          fullName\n          lastName\n          firstName\n          username\n          email\n          avatar\n          phone\n          birthday\n          sex\n          createAt\n          updateAt\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n        query getUser($username: String!) {\n          getUser(username: $username) {\n            code\n            success\n            message\n            user {\n              id\n              fullName\n              lastName\n              firstName\n              username\n              email\n              avatar\n              phone\n              birthday\n              sex\n              createAt\n              updateAt\n            }\n            errors {\n              message\n              field\n            }\n          }\n        }\n      "
): (typeof documents)["\n        query getUser($username: String!) {\n          getUser(username: $username) {\n            code\n            success\n            message\n            user {\n              id\n              fullName\n              lastName\n              firstName\n              username\n              email\n              avatar\n              phone\n              birthday\n              sex\n              createAt\n              updateAt\n            }\n            errors {\n              message\n              field\n            }\n          }\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    mutation createPost($content: String!, $images: [String!]!) {\n      createPost(createPostInput: { content: $content, images: $images }) {\n        code\n        success\n        message\n        post {\n          uuid\n          content\n          createAt\n          updateAt\n          images\n        }\n        errors {\n          field\n          message\n        }\n      }\n    }\n  "
): (typeof documents)["\n    mutation createPost($content: String!, $images: [String!]!) {\n      createPost(createPostInput: { content: $content, images: $images }) {\n        code\n        success\n        message\n        post {\n          uuid\n          content\n          createAt\n          updateAt\n          images\n        }\n        errors {\n          field\n          message\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    query posts {\n      posts {\n        code\n        success\n        message\n        posts {\n          uuid\n          content\n          createAt\n          updateAt\n          shares\n          images\n          user {\n            avatar\n            username\n            fullName\n          }\n          likes {\n            id\n            reactions\n            user {\n              avatar\n              username\n              fullName\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              avatar\n              username\n              fullName\n            }\n          }\n        }\n      }\n    }\n  "
): (typeof documents)["\n    query posts {\n      posts {\n        code\n        success\n        message\n        posts {\n          uuid\n          content\n          createAt\n          updateAt\n          shares\n          images\n          user {\n            avatar\n            username\n            fullName\n          }\n          likes {\n            id\n            reactions\n            user {\n              avatar\n              username\n              fullName\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              avatar\n              username\n              fullName\n            }\n          }\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    query getUsers {\n      getUsers {\n        code\n        success\n        message\n        users {\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "
): (typeof documents)["\n    query getUsers {\n      getUsers {\n        code\n        success\n        message\n        users {\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n      mutation commentPost($postUuid: String!, $content: String!) {\n        commentPost(postUuid: $postUuid, content: $content) {\n          code\n          success\n          message\n          comment {\n            id\n            user {\n              username\n              fullName\n              avatar\n            }\n            content\n            likes {\n              id\n              reactions\n              user {\n                username\n                fullName\n                avatar\n              }\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              username\n              fullName\n              avatar\n            }\n            likes {\n              id\n              user {\n                username\n                fullName\n                avatar\n              }\n              reactions\n            }\n          }\n        }\n      }\n    "
): (typeof documents)["\n      mutation commentPost($postUuid: String!, $content: String!) {\n        commentPost(postUuid: $postUuid, content: $content) {\n          code\n          success\n          message\n          comment {\n            id\n            user {\n              username\n              fullName\n              avatar\n            }\n            content\n            likes {\n              id\n              reactions\n              user {\n                username\n                fullName\n                avatar\n              }\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              username\n              fullName\n              avatar\n            }\n            likes {\n              id\n              user {\n                username\n                fullName\n                avatar\n              }\n              reactions\n            }\n          }\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n      mutation likePost($postUuid: String!, $typeReact: String!) {\n        likePost(postUuid: $postUuid, typeReact: $typeReact) {\n          code\n          success\n          message\n          like {\n            id\n            reactions\n            user {\n              fullName\n              username\n            }\n          }\n        }\n      }\n    "
): (typeof documents)["\n      mutation likePost($postUuid: String!, $typeReact: String!) {\n        likePost(postUuid: $postUuid, typeReact: $typeReact) {\n          code\n          success\n          message\n          like {\n            id\n            reactions\n            user {\n              fullName\n              username\n            }\n          }\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n      query getUser($username: String!) {\n        getUser(username: $username) {\n          code\n          success\n          message\n          user {\n            id\n            fullName\n            lastName\n            firstName\n            username\n            email\n            avatar\n            phone\n            birthday\n            sex\n            createAt\n            updateAt\n          }\n          errors {\n            message\n            field\n          }\n        }\n      }\n    "
): (typeof documents)["\n      query getUser($username: String!) {\n        getUser(username: $username) {\n          code\n          success\n          message\n          user {\n            id\n            fullName\n            lastName\n            firstName\n            username\n            email\n            avatar\n            phone\n            birthday\n            sex\n            createAt\n            updateAt\n          }\n          errors {\n            message\n            field\n          }\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    query user {\n      user {\n        code\n        success\n        message\n        user {\n          id\n          fullName\n          lastName\n          firstName\n          username\n          email\n          avatar\n          phone\n          birthday\n          sex\n          createAt\n          updateAt\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "
): (typeof documents)["\n    query user {\n      user {\n        code\n        success\n        message\n        user {\n          id\n          fullName\n          lastName\n          firstName\n          username\n          email\n          avatar\n          phone\n          birthday\n          sex\n          createAt\n          updateAt\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
