/** @type {import("next").NextConfig} */

const withSerwistInit = require("@serwist/next").default;

const withSerwist = withSerwistInit({
  swSrc: "worker/index.js",
  swDest: "public/sw.js",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];

module.exports = withSerwist({
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "100.111.68.103" },
      { protocol: "https", hostname: "i.imgur.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
});
