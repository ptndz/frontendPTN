import { GetServerSideProps } from "next";
import Register from "../components/Auth/Register";
import { graphQLServer } from "../plugins/graphql.plugin";
import { queryUser } from "../graphql/user";
import { getCookies } from "cookies-next";
import { NextSeo } from "next-seo";

const RegisterPage = () => {
  return (
    <>
      <NextSeo
        title="Register"
        description="Chào mừng bạn đến với trang đăng ký của chúng tôi! Nơi đây là để bạn có thể đăng ký tài khoản trên mạng xã hội của chúng tôi một cách đơn giản và nhanh chóng. Với tài khoản của bạn, bạn có thể dễ dàng kết nối với bạn bè, chia sẻ những khoảnh khắc tuyệt vời trong cuộc sống, và tham gia vào cộng đồng của chúng tôi. Hãy đăng ký ngay hôm nay và trải nghiệm các tính năng tuyệt vời của mạng xã hội của chúng tôi. Nếu bạn có bất kỳ câu hỏi nào, xin vui lòng liên hệ với chúng tôi. Chúc bạn một ngày tốt lành!"
        canonical="https://phamthanhnam.com/register"
      />
      <Register />;
    </>
  );
};

export default RegisterPage;

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
