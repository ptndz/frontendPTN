import React from "react";
import MessagingMain from "../components/Messages";
import { User } from "../gql/graphql";
import { NextSeo } from "next-seo";
import { withAuthSSP } from "../lib/with-auth-ssp";
import { useInitUser } from "../hooks/useInitUser";

interface IProps {
  userData: User;
}
const MessengerPage: React.FC<IProps> = ({ userData }) => {
  useInitUser(userData);
  return (
    <>
      <NextSeo
        title="Messenger"
        description="Tính năng nhắn tin trên mạng xã hội cho phép người dùng gửi tin nhắn văn bản, hình ảnh, video và âm thanh cho nhau thông qua nền tảng của mạng xã hội đó. Người dùng có thể trò chuyện với bạn bè, gia đình, đồng nghiệp hoặc tìm kiếm và kết nối với những người mới trên mạng. Tính năng nhắn tin giúp người dùng tiết kiệm thời gian và tiền bạc so với việc gọi điện thoại hoặc gửi thư truyền thống. Ngoài ra, tính năng này còn cho phép người dùng gửi thông điệp và nhận phản hồi ngay lập tức, làm cho việc liên lạc trở nên nhanh chóng và thuận tiện hơn."
        canonical="https://phamthanhnam.com/messenger"
      />
      <MessagingMain />
    </>
  );
};

export default MessengerPage;
export const getServerSideProps = withAuthSSP();
