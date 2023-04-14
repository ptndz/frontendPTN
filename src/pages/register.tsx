import { GetServerSideProps } from "next";
import Register from "../components/Auth/Register";
import { graphQLServer } from "../plugins/graphql.plugin";
import { queryUser } from "../graphql/user";
import { getCookies } from "cookies-next";

const RegisterPage = () => {
  return <Register />;
};

export default RegisterPage;

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
