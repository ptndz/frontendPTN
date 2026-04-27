import { GraphQLClient } from "graphql-request";
import { getCookie } from "cookies-next";

import { refreshToken } from "./axios.plugin";
import { clearAuthCookies } from "../lib/auth/session";

const endpoint = process.env.NEXT_PUBLIC_URL_GRAPHQL as string;

function getAccessToken(): string {
  return (getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string) as string) ?? "";
}

export function getGraphQLClient(): GraphQLClient {
  return new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    credentials: "include",
  });
}

export const graphQLClient = {
  request: (...args: Parameters<GraphQLClient["request"]>) =>
    getGraphQLClient().request(...args),
};

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
        clearAuthCookies();
        break;
    }
    return false;
  }
  return true;
};
