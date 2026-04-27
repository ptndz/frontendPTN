import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { getAuthenticatedUser } from "./pages-router-auth";
import { User } from "../gql/graphql";

export function withAuthSSP(
  handler?: (
    user: User,
    context: GetServerSidePropsContext
  ) => Promise<GetServerSidePropsResult<any>>
): GetServerSideProps {
  return async (context) => {
    try {
      const user = await getAuthenticatedUser(context);
      if (user) {
        if (handler) return handler(user, context);
        return { props: { userData: user } };
      }
    } catch {}
    return { redirect: { destination: "/login", permanent: false } };
  };
}
