import { GetServerSideProps } from "next";
import ResetPassword from "../../components/Auth/ResetPassword";
import { graphQLServer } from "../../plugins/graphql.plugin";
import { queryUser } from "../../graphql/user";
import { getCookies } from "cookies-next";
interface IProps {
  token: string;
}
const ResetPasswordPage: React.FC<IProps> = ({ token }) => {
  return <ResetPassword token={token} />;
};

export default ResetPasswordPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { token } = context.query;

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
    if (token) {
      return {
        props: {
          token: token,
        },
      };
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
