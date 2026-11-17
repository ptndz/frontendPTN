import { useState } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import Link from "next/link";
import Logo from "../Share/Logo";
import LanguageSwitcher from "../Share/LanguageSwitcher";

import { Controller, useForm } from "react-hook-form";
import {
  queryLogin,
  QUERY_VERIFY_TWO_FACTOR_LOGIN,
} from "../../graphql/user";
import { graphQLClient } from "../../plugins/graphql.plugin";
import socket from "../../plugins/socket";
import { toast } from "react-toastify";

import { useStoreUser } from "../../store/user";
import { useI18n } from "../../i18n/I18nProvider";
import { useRouter } from "next/router";
import { setAuthCookies } from "../../lib/auth/session";

import { FormLayout } from "@astryxdesign/core/FormLayout";
import { InputGroup } from "@astryxdesign/core/InputGroup";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Button } from "@astryxdesign/core/Button";
import { Link as AstryxLink } from "@astryxdesign/core/Link";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Divider } from "@astryxdesign/core/Divider";
import { Stack } from "@astryxdesign/core/Stack";
import { StackItem } from "@astryxdesign/core/Stack";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";

const Login = () => {
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // P3.3 — bước 2 đăng nhập (2FA): login trả về token tạm thay vì token thật.
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { setUser } = useStoreUser();
  const { t } = useI18n();
  const router = useRouter();

  /** Hoàn tất đăng nhập khi đã có access/refresh token thật. */
  const finishLogin = (res: any) => {
    const accessToken = res.accessToken;
    if (!accessToken) {
      toast.error(t("common.systemError"));
      setIsLoading(false);
      return;
    }
    const refreshToken = res.refreshToken;
    if (!refreshToken) {
      toast.error(t("common.systemError"));
      setIsLoading(false);
      return;
    }
    if (!res.user) {
      toast.error(t("common.systemError"));
      setIsLoading(false);
      return;
    }
    try {
      setAuthCookies({
        accessToken,
        refreshToken,
        userId: res.user.id,
      });
    } catch (error) {
      console.log(error);
    }

    // F5 fix: the shared socket is imported at module load, when no token
    // exists yet — the first handshake is rejected (CONNECT_ERROR) and the
    // socket destroys itself with no auto-reconnect. Now that we have a
    // valid token, revive it explicitly; the auth function in socket.ts
    // re-reads the fresh cookie on this handshake.
    if (socket.disconnected) socket.connect();

    setUser(res.user);
    setIsLoading(false);
    return router.push("/");
  };

  const onSubmitTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorToken) return;
    setIsLoading(true);
    try {
      const res: any = await graphQLClient.request(
        QUERY_VERIFY_TWO_FACTOR_LOGIN,
        { token: twoFactorToken, code: twoFactorCode }
      );
      const payload = res.verifyTwoFactorLogin;
      if (!payload || payload.code !== 200) {
        toast.error(payload?.message || t("auth.wrongCode"));
        setIsLoading(false);
        return;
      }
      finishLogin(payload);
    } catch {
      toast.error(t("auth.wrongCode"));
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await graphQLClient.request(queryLogin, {
        email: data.email,
        password: data.password,
      });
      if (res.login.code !== 200) {
        toast.error(res.login.message || t("auth.loginFailed"));
        return;
      }
      // P3.3 — tài khoản bật 2FA: chuyển sang nhập mã bước 2.
      if (res.login.requiresTwoFactor && res.login.twoFactorToken) {
        setTwoFactorToken(res.login.twoFactorToken);
        return;
      }
      finishLogin(res.login);
    } catch {
      // Lỗi GraphQL/mạng (vd: 429) cũng phải trả nút về trạng thái thường
      // và báo lỗi cho người dùng, tránh kẹt ở "Loading...".
      toast.error(t("auth.loginFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="lg:py-10 lg:px-6">
      <Stack
        direction="horizontal"
        maxWidth={1024}
        minHeight="100vh"
        className="mx-auto overflow-hidden rounded-xl">
        <StackItem className="hidden bg-surface bg-pattern-login lg:block lg:basis-2/5" />
        <StackItem size="fill" className="bg-surface">
          <VStack className="mx-auto my-8 w-full max-w-md px-4 lg:px-0" gap={6}>
            <VStack gap={2} paddingBlockEnd={4}>
              <HStack justify="end">
                <LanguageSwitcher />
              </HStack>
              <Link href="/">
                <Logo
                  size={48}
                  showWordmark
                  wordmarkClassName="whitespace-nowrap text-lg font-bold tracking-widest"
                />
              </Link>
              <Heading level={1} weight="bold">
                {t("auth.loginTitle")}
              </Heading>
            </VStack>
            <form onSubmit={handleSubmit(onSubmit)}>
              <VStack gap={6}>
                <FormLayout>
                  <Controller
                    name="email"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <TextInput
                        label={t("auth.emailLabel")}
                        isRequired
                        type="text"
                        autoComplete="text"
                        placeholder={t("auth.emailPlaceholder")}
                        htmlName={field.name}
                        value={field.value ?? ""}
                        onChange={(value) => field.onChange(value)}
                        status={
                          errors.email ? { type: "error" } : undefined
                        }
                      />
                    )}
                  />
                  <Controller
                    name="password"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <InputGroup
                        label={t("auth.passwordLabel")}
                        isRequired
                        status={
                          errors.password ? { type: "error" } : undefined
                        }>
                        <TextInput
                          label={t("auth.passwordLabel")}
                          isLabelHidden
                          type={showPass ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder={t("auth.passwordPlaceholder")}
                          htmlName={field.name}
                          value={field.value ?? ""}
                          onChange={(value) => field.onChange(value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          isIconOnly
                          icon={showPass ? <BsEye /> : <BsEyeSlash />}
                          label={t("auth.passwordLabel")}
                          onClick={() => setShowPass(!showPass)}
                        />
                      </InputGroup>
                    )}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    label={isLoading ? t("auth.loading") : t("auth.signIn")}
                    isLoading={isLoading}
                    width="100%"
                  />
                </FormLayout>
                <AstryxLink href="/forgotpassword" size="sm" isStandalone>
                  {t("auth.forgot")}
                </AstryxLink>
              </VStack>
            </form>

            {/* P3.3 — bước 2: nhập mã TOTP (hoặc 1 mã dự phòng). */}
            {twoFactorToken && (
              <form onSubmit={onSubmitTwoFactor}>
                <FormLayout>
                  <TextInput
                    label={t("auth.twoFactorTitle")}
                    isRequired
                    description={t("auth.twoFactorHint")}
                    type="text"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={twoFactorCode}
                    onChange={(value) => setTwoFactorCode(value)}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    label={isLoading ? t("auth.checking") : t("auth.confirm")}
                    isLoading={isLoading}
                    width="100%"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    label={t("auth.backToLogin")}
                    onClick={() => {
                      setTwoFactorToken(null);
                      setTwoFactorCode("");
                    }}
                  />
                </FormLayout>
              </form>
            )}

            <VStack gap={6}>
              <Divider />
              <Text justify="center" weight="medium">
                {t("auth.newTo")}
                <AstryxLink href="/register" type="inherit">
                  &nbsp;&nbsp;{t("auth.signUp")}
                </AstryxLink>
              </Text>
            </VStack>
          </VStack>
        </StackItem>
      </Stack>
    </section>
  );
};

export default Login;
