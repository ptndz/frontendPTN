import { GetServerSideProps } from "next";
import ForgotPassword from "../components/Auth/Forgotpassword";
import { graphQLServer } from "../plugins/graphql.plugin";
import { queryUser } from "../graphql/user";
import { getCookies } from "cookies-next";

const ForgotPasswordPage = () => {
  return <ForgotPassword />;
};

export default ForgotPasswordPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookie = getCookies({ req: context.req });
    const accessToken = cookie[process.env.NEXT_PUBLIC_COOKIE_NAME as string];
    if (accessToken) {
      const res = await graphQLServer(
        context.req.headers.cookie,
        accessToken
      ).request(queryUser);

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
