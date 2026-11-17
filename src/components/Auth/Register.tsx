import { setCookie } from "cookies-next/client";
import Link from "next/link";
import Logo from "../Share/Logo";
import LanguageSwitcher from "../Share/LanguageSwitcher";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { toast } from "react-toastify";
import { queryRegister } from "../../graphql/user";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { useStoreUser } from "../../store/user";
import { useI18n } from "../../i18n/I18nProvider";

import { FormLayout } from "@astryxdesign/core/FormLayout";
import { InputGroup } from "@astryxdesign/core/InputGroup";
import { TextInput } from "@astryxdesign/core/TextInput";
import { DateInput } from "@astryxdesign/core/DateInput";
import { Field } from "@astryxdesign/core/Field";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import { Button } from "@astryxdesign/core/Button";
import { Link as AstryxLink } from "@astryxdesign/core/Link";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Divider } from "@astryxdesign/core/Divider";
import { Stack } from "@astryxdesign/core/Stack";
import { StackItem } from "@astryxdesign/core/Stack";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";

const Register = () => {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [sex, setSex] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const { setUser } = useStoreUser();
  const { t } = useI18n();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    if (data.password === data.confirmPass) {
      setIsLoading(true);
      const res = await graphQLClient.request(queryRegister, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        username: data.username,
        fullName: `${data.firstName} ${data.lastName}`,
        sex: sex,
        birthday: data.birthday,
        avatar: "https://i.imgur.com/rLpAsb4.png",
        coverImage: "https://i.imgur.com/rLpAsb4.png",
      });
      if (res.register.code != 200) {
        toast.error(res.register.message);
        if (res.register.errors) {
          // W6: errors là Maybe<FieldError>[] — phần tử có thể null.
          res.register.errors.forEach((err) => {
            if (err?.message) {
              toast.error(err.message);
            }
          });
        }
        setIsLoading(false);
        return;
      }
      const accessToken = res.register.accessToken;
      if (!accessToken) {
        toast.error(t("common.systemError"));
        setIsLoading(false);
        return;
      }
      const refreshToken = res.register.refreshToken;
      if (!refreshToken) {
        toast.error(t("common.systemError"));
        setIsLoading(false);
        return;
      }
      if (!res.register.user) {
        toast.error(t("common.systemError"));
        setIsLoading(false);
        return;
      }
      setCookie("uuid", res.register.user.id, {
        maxAge: 60 * 60 * 24 * 30,
      });
      setCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string, accessToken, {
        maxAge: 60 * 60 * 24 * 30,
      });
      setCookie(
        process.env.NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME as string,
        refreshToken,
        {
          maxAge: 60 * 60 * 24 * 30,
        }
      );
      setUser(res.register.user);
      // P3.5 — backend đã gửi email xác nhận tài khoản.
      toast.success(t("auth.registerSuccess"));
      setIsLoading(false);
      return router.push("/");
    } else {
      toast.warn(t("auth.passwordMismatch"));
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
                {t("auth.registerTitle")}
              </Heading>
            </VStack>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormLayout>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextInput
                      label={t("auth.firstName")}
                      isRequired
                      type="text"
                      autoComplete="given-name"
                      placeholder={t("auth.firstNamePlaceholder")}
                      htmlName={field.name}
                      value={field.value ?? ""}
                      onChange={(value) => field.onChange(value)}
                      status={
                        errors.firstName ? { type: "error" } : undefined
                      }
                    />
                  )}
                />
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextInput
                      label={t("auth.lastName")}
                      isRequired
                      type="text"
                      autoComplete="given-name"
                      placeholder={t("auth.lastNamePlaceholder")}
                      htmlName={field.name}
                      value={field.value ?? ""}
                      onChange={(value) => field.onChange(value)}
                      status={errors.lastName ? { type: "error" } : undefined}
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextInput
                      label={t("auth.emailLabel")}
                      isRequired
                      type="email"
                      autoComplete="email"
                      placeholder={t("auth.registerEmailPlaceholder")}
                      htmlName={field.name}
                      value={field.value ?? ""}
                      onChange={(value) => field.onChange(value)}
                      status={errors.email ? { type: "error" } : undefined}
                    />
                  )}
                />
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: true,
                    pattern: /^(0\W*\W*(?:\d\W*){9})$/,
                  }}
                  render={({ field }) => (
                    <TextInput
                      label={t("auth.phoneLabel")}
                      isRequired
                      type="tel"
                      autoComplete="phone"
                      placeholder={t("auth.phonePlaceholder")}
                      htmlName={field.name}
                      value={field.value ?? ""}
                      onChange={(value) => field.onChange(value)}
                      status={errors.phone ? { type: "error" } : undefined}
                    />
                  )}
                />
                <Controller
                  name="username"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextInput
                      label={t("auth.usernameLabel")}
                      isRequired
                      type="text"
                      autoComplete="given-name"
                      placeholder={t("auth.usernamePlaceholder")}
                      htmlName={field.name}
                      value={field.value ?? ""}
                      onChange={(value) => field.onChange(value)}
                      status={errors.username ? { type: "error" } : undefined}
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
                        placeholder={t("auth.registerPasswordPlaceholder")}
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
                <Controller
                  name="confirmPass"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <InputGroup
                      label={t("auth.retypeLabel")}
                      isRequired
                      status={
                        errors.confirmPass ? { type: "error" } : undefined
                      }>
                      <TextInput
                        label={t("auth.retypeLabel")}
                        isLabelHidden
                        type={showPassConfirm ? "text" : "password"}
                        placeholder={t("auth.registerPasswordPlaceholder")}
                        htmlName={field.name}
                        value={field.value ?? ""}
                        onChange={(value) => field.onChange(value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        isIconOnly
                        icon={showPassConfirm ? <BsEye /> : <BsEyeSlash />}
                        label={t("auth.retypeLabel")}
                        onClick={() => setShowPassConfirm(!showPassConfirm)}
                      />
                    </InputGroup>
                  )}
                />
                <Controller
                  name="birthday"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <DateInput
                      label={t("auth.birthdayLabel")}
                      isRequired
                      placeholder={t("auth.birthdayPlaceholder")}
                      min="1970-01-01"
                      max="2030-12-31"
                      value={field.value ?? ""}
                      onChange={(value) => field.onChange(value ?? "")}
                      status={
                        errors.birthday ? { type: "error" } : undefined
                      }
                    />
                  )}
                />
                <Field
                  label={t("auth.sexLabel")}
                  inputID="sex"
                  isRequired
                  isGroupLabel>
                  <SegmentedControl
                    label={t("auth.sexLabel")}
                    value={sex ? "true" : "false"}
                    onChange={(value) => setSex(value === "true")}>
                    <SegmentedControlItem value="true" label={t("auth.male")} />
                    <SegmentedControlItem
                      value="false"
                      label={t("auth.female")}
                    />
                  </SegmentedControl>
                </Field>
                <Button
                  type="submit"
                  variant="primary"
                  label={isLoading ? t("auth.loading") : t("auth.register")}
                  isLoading={isLoading}
                  width="100%"
                />
              </FormLayout>
            </form>

            <VStack gap={6}>
              <Divider />
              <Text justify="center" weight="medium">
                {t("auth.haveAccount")}
                <AstryxLink href="/login" type="inherit">
                  &nbsp;&nbsp;{t("auth.signIn")}
                </AstryxLink>
              </Text>
            </VStack>
          </VStack>
        </StackItem>
      </Stack>
    </section>
  );
};

export default Register;
