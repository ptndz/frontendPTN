/** @type {import("next").NextConfig} */

const withSerwistInit = require("@serwist/next").default;

const withSerwist = withSerwistInit({
  swSrc: "worker/index.js",
  swDest: "public/sw.js",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

module.exports = withSerwist({
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "100.111.68.103" },
      { protocol: "https", hostname: "i.imgur.com" },
    ],
  },
});
