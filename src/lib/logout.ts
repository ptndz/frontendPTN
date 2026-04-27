import { NextRouter } from "next/router";
import { graphql } from "../gql";
import { getGraphQLClient } from "../plugins/graphql.plugin";
import { clearAuthCookies } from "./auth/session";

export async function logout(router: NextRouter): Promise<void> {
  const queryLogout = graphql(`
    mutation logout {
      logout
    }
  `);
  try {
    const res = await getGraphQLClient().request(queryLogout);
    if (res.logout) {
      clearAuthCookies();
      router.push("/login");
    }
  } catch (error) {
    console.warn(error);
  }
}
