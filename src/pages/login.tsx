import { GetServerSideProps } from "next";
import Login from "../components/Auth/Login";
import { queryUser } from "../graphql/user";
import { graphQLServer } from "../plugins/graphql.plugin";
import { getCookies } from "cookies-next";

const LoginPage = () => {
  return <Login />;
};

export default LoginPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookie = getCookies({ req: context.req });
    if (cookie["ASP.NET_SessionId"]) {
      const res = await graphQLServer(context.req.headers.cookie).request(
        queryUser
      );

      if (res.user.user) {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
    return {
      props: {},
    };
  } catch (error) {
    return {
      props: {},
    };
  }
};
