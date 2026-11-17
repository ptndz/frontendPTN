import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // P5a — chỉ test logic thuần trong src/lib (không jsdom, không render
    // component: tránh kéo React Testing Library + jsdom vào repo). Test
    // đặt ngoài src/ (tests/) để không đụng worker i18n đang sửa src/.
    include: ["tests/**/*.test.ts"],
    environment: "node",
    testTimeout: 10000,
  },
});
