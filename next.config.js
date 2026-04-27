/** @type {import("next").NextConfig} */

const withSerwistInit = require("@serwist/next").default;

const withSerwist = withSerwistInit({
  swSrc: "worker/index.js",
  swDest: "public/sw.js",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://i.imgur.com",
      "connect-src 'self' ws: wss:",
      "font-src 'self'",
    ].join("; "),
  },
];

module.exports = withSerwist({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost", "i.imgur.com", "mxhserver.test", "mxhclient.test"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
});
