/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

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
    "\n  mutation Login($loginInput: LoginInput!) {\n    login(loginInput: $loginInput) {\n      code\n      success\n      message\n      user {\n        id\n        username\n        firstName\n        email\n        lastName\n        email\n        createAt\n        username\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  query hello {\n    hello\n  }\n": types.HelloDocument,
    "\n  mutation Register($registerUser: RegisterInput!) {\n    register(registerInput: $registerUser) {\n      code\n      success\n      message\n      user {\n        id\n        username\n        firstName\n        email\n        lastName\n        email\n        createAt\n        username\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n": types.RegisterDocument,
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
export function graphql(source: "\n  mutation Login($loginInput: LoginInput!) {\n    login(loginInput: $loginInput) {\n      code\n      success\n      message\n      user {\n        id\n        username\n        firstName\n        email\n        lastName\n        email\n        createAt\n        username\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($loginInput: LoginInput!) {\n    login(loginInput: $loginInput) {\n      code\n      success\n      message\n      user {\n        id\n        username\n        firstName\n        email\n        lastName\n        email\n        createAt\n        username\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query hello {\n    hello\n  }\n"): (typeof documents)["\n  query hello {\n    hello\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($registerUser: RegisterInput!) {\n    register(registerInput: $registerUser) {\n      code\n      success\n      message\n      user {\n        id\n        username\n        firstName\n        email\n        lastName\n        email\n        createAt\n        username\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Register($registerUser: RegisterInput!) {\n    register(registerInput: $registerUser) {\n      code\n      success\n      message\n      user {\n        id\n        username\n        firstName\n        email\n        lastName\n        email\n        createAt\n        username\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;