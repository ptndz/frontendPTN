import { GetServerSideProps } from "next";
import { graphQLServer } from "../../plugins/graphql.plugin";
import { graphql } from "../../gql";

interface IProps {
  token: string;
}
const ConfirmationPage: React.FC<IProps> = ({ token }) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
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
      props: {},
    };
  } catch (error) {
    return {
      props: {},
    };
  }
};
