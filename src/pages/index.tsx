import LeftSideBar from "../components/Home/LeftSideBar";
import MiddleLeftBar from "../components/Home/MiddleLeftBar";
import RightSideBar from "../components/Home/RightSideBar";
import Navigation from "../components/Share/Navigation";

import { useStoreUser } from "../store/user";

import { useEffect } from "react";
import { queryUser } from "../graphql/user";
import { graphQLServer } from "../plugins/graphql.plugin";
import Login from "../components/Auth/Login";
import { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";
import { User } from "../gql/graphql";

interface IProps {
  userData: User;
}

const Home: React.FC<IProps> = ({ userData }) => {
  const { setUser } = useStoreUser();

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [setUser, userData]);

  if (userData) {
    return (
      <div className="bg-neutral-100 dark:bg-zinc-900">
        <Navigation />
        <div className="mt-2">
          <div className="grid grid-cols-12 mx-auto 2xl:max-w-[1560px] gap-6">
            <div className="col-span-3 max-w-2xl hidden lg:block h-[89vh] overflow-y-scroll scrollbar	scrollbar-hide hover:scrollbar-default px-2">
              <LeftSideBar />
            </div>
            <div className="col-span-12 lg:col-span-6 w-full mx-auto h-[89vh] scrollbar-hide overflow-y-scroll scrollbar scroll-ml-5">
              <div className="col-span-12 max-w-2xl mx-auto">
                <MiddleLeftBar />
              </div>
            </div>
            <div className="col-span-3 max-w-2xl hidden lg:block h-[89vh] overflow-y-scroll scrollbar	scrollbar-hide hover:scrollbar-default px-2">
              <RightSideBar />
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <Login />;
  }
};
export default Home;
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookie = getCookies({ req: context.req });
    const accessToken = cookie[process.env.NEXT_PUBLIC_COOKIE_NAME as string];
    if (accessToken) {
      const res = await graphQLServer(context.req.headers.cookie,accessToken).request(
        queryUser
      );
      if (res.user.user) {
        return {
          props: {
            userData: res.user.user,
          },
        };
      }
    }
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
};
