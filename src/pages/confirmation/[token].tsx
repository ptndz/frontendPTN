import { GetServerSideProps } from "next";
import { graphQLServer } from "../../plugins/graphql.plugin";
import { graphql } from "../../gql";

interface IProps {
  token: string;
}

const ConfirmationPage: React.FC<IProps> = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto">
          <svg className="animate-spin w-16 h-16 text-emerald-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Verifying your account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Please wait a moment...
          </p>
        </div>
      </div>
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

    return { props: {} };
  } catch (error) {
    return { props: {} };
  }
};
