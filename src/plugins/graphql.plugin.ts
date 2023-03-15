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
import { getCookie } from "cookies-next";
const endpoint = process.env.NEXT_PUBLIC_URL_GRAPHQL as string;
const token = getCookie("awt");
const executor = buildHTTPExecutor({
  endpoint: endpoint,
  headers: {
    Authorization: `Bearer ${token}`,
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
  credentials: "include",
  mode: "cors",
});
