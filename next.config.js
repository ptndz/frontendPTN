/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "images.unsplash.com",
      "static.xx.fbcdn.net",
      "random.imagecdn.app",
      "i.ibb.co",
      "localhost",
    ],
  },
};

module.exports = nextConfig;
