import { DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  title: "Pham Thanh Nam",
  titleTemplate: "%s | Pham Thanh Nam",
  defaultTitle: "Pham Thanh Nam",
  description:
    "Website này là nơi để bạn chia sẻ và khám phá những hình ảnh độc đáo và sáng tạo về code IT, công nghệ và các sản phẩm công nghệ mới nhất. Bạn có thể đăng tải những hình ảnh của bạn kèm theo mô tả và thẻ để thu hút sự chú ý của cộng đồng. Bạn cũng có thể xem, thích và bình luận những hình ảnh của người khác hoặc tìm kiếm theo từ khóa hoặc thẻ. Bạn cũng có thể tạo hồ sơ cá nhân để giới thiệu bản thân và kết nối với những người dùng có cùng sở thích.",

  canonical: "https://phamthanhnam.com",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://phamthanhnam.com",
    siteName: "SiteName",
  },
  twitter: {
    handle: "@handle",
    site: "@site",
    cardType: "summary_large_image",
  },
};

export default config;
