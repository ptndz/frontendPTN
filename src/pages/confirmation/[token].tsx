import { GetServerSideProps } from "next";
import { graphQLServer } from "../../plugins/graphql.plugin";
import { graphql } from "../../gql";
import { Button } from "@astryxdesign/core/Button";
import { Center } from "@astryxdesign/core/Center";
import { Heading } from "@astryxdesign/core/Heading";
import { Spinner } from "@astryxdesign/core/Spinner";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useI18n } from "../../i18n/I18nProvider";

interface IProps {
  invalid?: boolean;
}
const ConfirmationPage: React.FC<IProps> = ({ invalid }) => {
  const { t } = useI18n();
  if (invalid) {
    return (
      <Center axis="both" minHeight="80vh">
        <Stack gap={4} hAlign="center">
          <Heading level={1} justify="center">
            {t("confirmation.invalidTitle")}
          </Heading>
          <Text justify="center">
            {t("confirmation.invalidHint")}
          </Text>
          <Button label={t("auth.signIn")} href="/login" variant="primary" />
        </Stack>
      </Center>
    );
  }

  return (
    <Center height="100vh">
      <Spinner size="xl" />
    </Center>
  );
};

export default ConfirmationPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { token } = context.query;

    if (token) {
      const queryConfirmation = graphql(`
        query confirmation($token: String!) {
          confirmation(token: $token)
        }
      `);
      const res = await graphQLServer("", "").request(queryConfirmation, {
        token: token as string,
      });

      if (res.confirmation) {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }

    return {
      props: { invalid: true },
    };
  } catch (error) {
    return {
      props: { invalid: true },
    };
  }
};
