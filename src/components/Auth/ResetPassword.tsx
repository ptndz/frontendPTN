import { useState } from "react";
import { BsEyeSlash, BsEye } from "react-icons/bs";
import Link from "next/link";
import Logo from "../Share/Logo";
import LanguageSwitcher from "../Share/LanguageSwitcher";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { queryResetPassword } from "../../graphql/user";

import { useRouter } from "next/router";
import { useI18n } from "../../i18n/I18nProvider";

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

interface IProps {
  token: string;
}

const ResetPassword: React.FC<IProps> = ({ token }) => {
  const router = useRouter();
  const { t } = useI18n();
  const [showPass, setShowPass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    if (data.password === data.confirmPass) {
      setIsLoading(true);
      const res = await graphQLClient.request(queryResetPassword, {
        token: token,
        password: data.password,
      });
      if (res.resetPassword) {
        setIsLoading(false);
        return router.push("/");
      }

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
                {t("auth.resetTitle")}
              </Heading>
            </VStack>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormLayout>
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
                <Button
                  type="submit"
                  variant="primary"
                  label={isLoading ? t("auth.loading") : t("auth.resetSubmit")}
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

export default ResetPassword;
