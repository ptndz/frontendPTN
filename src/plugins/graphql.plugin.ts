/* eslint-disable import/no-extraneous-dependencies */
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { TypedDocumentNode } from "@graphql-typed-document-node/core";
import {
  ASTNode,
  ExecutionResult,
  Kind,
  OperationDefinitionNode,
} from "graphql";
import { useQuery } from "@tanstack/react-query";
import { GraphQLClient } from "graphql-request";
import { deleteCookie, getCookie } from "cookies-next";

import { refreshToken } from "./axios.plugin";
const endpoint = process.env.NEXT_PUBLIC_URL_GRAPHQL as string;
const aToken = getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string);

const executor = buildHTTPExecutor({
  endpoint: endpoint,
  headers: {
    Authorization: `Bearer ${aToken}`,
  },
});

const isOperationDefinition = (def: ASTNode): def is OperationDefinitionNode =>
  def.kind === Kind.OPERATION_DEFINITION;

export function useGraphQL<TResult, TVariables>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  return useQuery(
    [
      // This logic can be customized as desired
      document.definitions.find(isOperationDefinition)?.name,
      variables,
    ] as const,
    async ({ queryKey }) =>
      executor({
        document: document as any,
        variables: queryKey[1] as any,
      }) as Promise<ExecutionResult<TResult>>
  );
}
export const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${aToken}`,
  },
  credentials: "include",
});

export const graphQLServer = (
  cookie: string | undefined,
  token: string | undefined
) => {
  return new GraphQLClient(endpoint, {
    headers: {
      cookie: cookie || "",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const graphQLClientErrorCheck = (response: any) => {
  if (response.errors) {
    const error = response.errors[0];
    switch (error.extensions.code) {
      case "JWT_EXPIRED":
        refreshToken();
        break;
      default:
        deleteCookie("accessToken");
        deleteCookie("uuid");
        deleteCookie("awt");
        break;
    }
    return false;
  }
  return true;
};
