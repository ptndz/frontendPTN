import { GetServerSideProps } from "next";
import Login from "../components/Auth/Login";
import { queryUser } from "../graphql/user";
import { graphQLServer } from "../plugins/graphql.plugin";
import { getCookies } from "cookies-next";
import { NextSeo } from "next-seo";

const LoginPage = () => {
  return (
    <>
      <NextSeo
        title="Login"
        description="Chào mừng bạn đến với trang đăng nhập của mạng xã hội của chúng tôi! Bên cạnh tính năng hấp dẫn, việc đăng nhập cũng giúp tăng tốc độ tìm kiếm trang web của chúng tôi trên các công cụ tìm kiếm. Đăng nhập ngay hôm nay và trải nghiệm các tính năng tuyệt vời của mạng xã hội của chúng tôi. Nếu bạn quên mật khẩu hoặc có bất kỳ câu hỏi nào, hãy liên hệ với chúng tôi. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!"
        canonical="https://phamthanhnam.com/login"
      />
      <Login />
    </>
  );
};

export default LoginPage;

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
