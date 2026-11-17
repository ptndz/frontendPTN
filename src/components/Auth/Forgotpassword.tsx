import { useState } from "react";

import Link from "next/link";
import Logo from "../Share/Logo";
import LanguageSwitcher from "../Share/LanguageSwitcher";
import { Controller, useForm } from "react-hook-form";

import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { queryForgotPassword } from "../../graphql/user";
import { useI18n } from "../../i18n/I18nProvider";

import { FormLayout } from "@astryxdesign/core/FormLayout";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Button } from "@astryxdesign/core/Button";
import { Banner } from "@astryxdesign/core/Banner";
import { Link as AstryxLink } from "@astryxdesign/core/Link";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Divider } from "@astryxdesign/core/Divider";
import { Stack } from "@astryxdesign/core/Stack";
import { StackItem } from "@astryxdesign/core/Stack";
import { VStack } from "@astryxdesign/core/VStack";
import { HStack } from "@astryxdesign/core/HStack";

const ForgotPassword = () => {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [showText, setShowText] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    if (data.email) {
      const res = await graphQLClient.request(queryForgotPassword, {
        email: data.email,
      });
      if (graphQLClientErrorCheck(res)) {
        setShowText(true);
      }
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
                {t("auth.forgotTitle")}
              </Heading>
            </VStack>
            {showText && (
              <Banner status="success" title={t("auth.sentTitle")} />
            )}
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormLayout>
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
                <Button
                  type="submit"
                  variant="primary"
                  label={isLoading ? t("auth.loading") : t("auth.reset")}
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

export default ForgotPassword;
