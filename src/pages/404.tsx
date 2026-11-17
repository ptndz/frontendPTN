import { generateNextSeo } from "next-seo/pages";
import { Button } from "@astryxdesign/core/Button";
import { Center } from "@astryxdesign/core/Center";
import { Heading } from "@astryxdesign/core/Heading";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useI18n } from "../i18n/I18nProvider";

const Error = () => {
  const { t } = useI18n();
  return (
    <>
      {generateNextSeo({ title: "404", canonical: "https://phamthanhnam.com/404" })}
      <Center axis="both" minHeight="80vh">
        <Stack gap={4} hAlign="center">
          <Heading level={1} type="display-2" justify="center">
            {t("notFound.title")}
          </Heading>
          <Text justify="center">
            {t("notFound.description")}
          </Text>
          <Button label={t("notFound.homeButton")} href="/" variant="primary" />
        </Stack>
      </Center>
    </>
  );
};

export default Error;
