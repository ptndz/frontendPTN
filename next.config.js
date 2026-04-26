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
  swcMinify: true,
  images: {
    domains: ["localhost", "i.imgur.com", "mxhserver.test", "mxhclient.test"],
  },
});
