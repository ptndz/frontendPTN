/**
 * Regression test cho 4 bug i18n/login sửa ngày 2026-11-11:
 * - Bug 5: typo "Wright a comment ..." / "loi he thong" trong dictionary vi.
 * - Bug 8: chuỗi demo "Aa@12345678" trên form Login.
 * - Bug 9: khối auth của dictionary vi còn toàn tiếng Anh.
 * - Bug 10: onSubmit của Login kẹt "Loading..." khi GraphQL lỗi (429...).
 *
 * Chỉ test logic thuần + nội dung file (không render component, không jsdom).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { en, vi } from "../src/i18n/dictionaries";

const loginSrc = readFileSync(
  new URL("../src/components/Auth/Login.tsx", import.meta.url),
  "utf8",
);

describe("bug 5 — typo trong dictionary vi", () => {
  it("post.writeComment viết đúng chính tả", () => {
    expect(vi.feed.post.writeComment).toBe("Viết bình luận...");
  });

  it("common.systemError là tiếng Việt có dấu", () => {
    expect(vi.common.systemError).toBe("Lỗi hệ thống");
  });

  it("không còn typo cũ trong toàn bộ dictionary vi", () => {
    const dump = JSON.stringify(vi);
    expect(dump).not.toContain("Wright");
    expect(dump).not.toContain("loi he thong");
  });
});

describe("bug 9 — khối auth của vi đã dịch sang tiếng Việt", () => {
  it("vi.auth và en.auth có cùng tập key (parity)", () => {
    expect(Object.keys(vi.auth).sort()).toEqual(Object.keys(en.auth).sort());
  });

  it("các chuỗi login/register/forgot/reset là tiếng Việt", () => {
    expect(vi.auth.loginTitle).toBe("Đăng nhập vào Pham Thanh Nam");
    expect(vi.auth.emailLabel).toBe("Địa chỉ email");
    expect(vi.auth.emailPlaceholder).toBe("Nhập email của bạn");
    expect(vi.auth.passwordLabel).toBe("Mật khẩu");
    expect(vi.auth.passwordPlaceholder).toBe("Nhập mật khẩu của bạn");
    expect(vi.auth.signIn).toBe("Đăng nhập");
    expect(vi.auth.loading).toBe("Đang tải...");
    expect(vi.auth.forgot).toBe("Quên mật khẩu?");
    expect(vi.auth.newTo).toBe("Mới đến Pham Thanh Nam?");
    expect(vi.auth.signUp).toBe("Đăng ký");
    expect(vi.auth.registerTitle).toBe("Tạo tài khoản");
    expect(vi.auth.firstName).toBe("Tên");
    expect(vi.auth.lastName).toBe("Họ");
    expect(vi.auth.phoneLabel).toBe("Số điện thoại");
    expect(vi.auth.usernameLabel).toBe("Tên đăng nhập");
    expect(vi.auth.retypeLabel).toBe("Nhập lại mật khẩu");
    expect(vi.auth.birthdayLabel).toBe("Ngày sinh");
    expect(vi.auth.sexLabel).toBe("Giới tính");
    expect(vi.auth.male).toBe("Nam");
    expect(vi.auth.female).toBe("Nữ");
    expect(vi.auth.register).toBe("Đăng ký");
    expect(vi.auth.haveAccount).toBe("Đã có tài khoản?");
    expect(vi.auth.passwordMismatch).toBe("Mật khẩu nhập lại không khớp");
    expect(vi.auth.forgotTitle).toBe("Quên mật khẩu");
    expect(vi.auth.sentTitle).toBe(
      "Chúng tôi đã gửi liên kết tới email của bạn",
    );
    expect(vi.auth.reset).toBe("Đặt lại");
    expect(vi.auth.resetTitle).toBe("Đặt lại mật khẩu");
    expect(vi.auth.resetSubmit).toBe("Đặt lại mật khẩu");
  });

  it("khối auth của en giữ nguyên tiếng Anh", () => {
    expect(en.auth.loginTitle).toBe("Sign in to Pham Thanh Nam");
    expect(en.auth.signIn).toBe("Sign in");
    expect(en.auth.loading).toBe("Loading...");
    expect(en.auth.registerTitle).toBe("Create an account");
    expect(en.auth.forgotTitle).toBe("Forgot Password");
    expect(en.auth.resetTitle).toBe("Reset password");
  });
});

describe("bug 8 + 10 — Login.tsx", () => {
  it("không còn chuỗi demo Aa@12345678", () => {
    expect(loginSrc).not.toContain("Aa@12345678");
  });

  it("onSubmit bọc GraphQL request bằng try/catch/finally và reset isLoading khi lỗi", () => {
    const start = loginSrc.indexOf("const onSubmit = async");
    expect(start).toBeGreaterThan(-1);
    // Khối onSubmit kết thúc trước `return (` của JSX.
    const end = loginSrc.indexOf("return (", start);
    const block = loginSrc.slice(start, end);
    expect(block).toContain("try {");
    expect(block).toContain("catch");
    expect(block).toContain("finally");
    expect(block).toContain("setIsLoading(false)");
    expect(block).toContain('toast.error(t("auth.loginFailed"))');
  });
});
