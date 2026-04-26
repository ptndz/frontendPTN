import { getCookies } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import { queryUser } from "../graphql/user";
import { User } from "../gql/graphql";
import { graphQLServer } from "../plugins/graphql.plugin";

export const getAuthenticatedUser = async (
  context: GetServerSidePropsContext
): Promise<User | null> => {
  const cookie = getCookies({ req: context.req });
  const accessToken = cookie[process.env.NEXT_PUBLIC_COOKIE_NAME as string];

  if (!accessToken) {
    return null;
  }

  const res = await graphQLServer(
    context.req.headers.cookie,
    accessToken as string
  ).request(queryUser);

  return res.user.user ?? null;
};
