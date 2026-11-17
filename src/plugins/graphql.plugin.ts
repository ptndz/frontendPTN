import { GraphQLClient } from "graphql-request";
import { getCookie } from "cookies-next/client";

import { refreshToken } from "./axios.plugin";
import { clearAuthCookies } from "../lib/auth/session";

const endpoint = process.env.NEXT_PUBLIC_URL_GRAPHQL as string;

/**
 * P0.4 — Không còn `aToken` gán cứng ở top-level nữa. Token được đọc fresh
 * từ cookie trong MỖI request: graphql-request v7 chấp nhận `headers` là
 * function (MaybeLazy) và gọi nó trước mỗi request, giống như Axios
 * interceptor trong axios.plugin.ts.
 */
export const graphQLClient = new GraphQLClient(endpoint, {
  headers: () => {
    const token = getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string);
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
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

/** Chỉ những lỗi này mới liên quan tới auth. */
const AUTH_ERROR_CODES = ["UNAUTHENTICATED", "JWT_EXPIRED"];

export const graphQLClientErrorCheck = (response: any) => {
  if (response?.errors?.length) {
    const error = response.errors[0];
    const code =
      typeof error?.extensions?.code === "string"
        ? error.extensions.code
        : undefined;
    const status =
      response?.status ?? error?.extensions?.response?.status ?? undefined;
    const message =
      typeof error?.message === "string" ? error.message : "";
    const isAuthError =
      (typeof code === "string" && AUTH_ERROR_CODES.includes(code)) ||
      status === 401 ||
      /unauthenticated|jwt_expired|jwt expired/i.test(message);

    if (code === "JWT_EXPIRED") {
      // Token hết hạn: thử refresh, không văng user.
      refreshToken();
    } else if (isAuthError) {
      clearAuthCookies();
    }
    // Lỗi GraphQL khác (không liên quan auth) -> không xóa cookie, không văng user.
    return false;
  }
  return true;
};
