import { GetServerSideProps } from "next";
import ForgotPassword from "../components/Auth/Forgotpassword";
import { graphQLServer } from "../plugins/graphql.plugin";
import { queryUser } from "../graphql/user";
import { getCookies } from "cookies-next";
import { NextSeo } from "next-seo";

const ForgotPasswordPage = () => {
  return (
    <>
      <NextSeo
        title="Forgot Password"
        description="Chào mừng bạn đến với trang quên mật khẩu của chúng tôi! Nếu bạn quên mật khẩu hoặc không thể đăng nhập vào tài khoản của mình, trang này sẽ giúp bạn khôi phục lại mật khẩu của mình. Điền thông tin yêu cầu để xác minh tài khoản của bạn, và sau đó làm theo hướng dẫn để đặt lại mật khẩu mới của bạn. Nếu bạn gặp bất kỳ vấn đề nào, hãy liên hệ với chúng tôi. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!"
        canonical="https://phamthanhnam.com/forgotpassword"
      />
      <ForgotPassword />
    </>
  );
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
