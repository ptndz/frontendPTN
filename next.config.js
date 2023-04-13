/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      "images.unsplash.com",
      "static.xx.fbcdn.net",
      "random.imagecdn.app",
      "i.ibb.co",
      "localhost",
      "encrypted-tbn0.gstatic.com",
    ],
  },
});
