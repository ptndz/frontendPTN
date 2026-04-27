import LeftSideBar from "../components/Home/LeftSideBar";
import MiddleLeftBar from "../components/Home/MiddleLeftBar";
import RightSideBar from "../components/Home/RightSideBar";
import Navigation from "../components/Share/Navigation";

import { User } from "../gql/graphql";
import dynamic from "next/dynamic";
import { withAuthSSP } from "../lib/with-auth-ssp";
import { useInitUser } from "../hooks/useInitUser";

const DynamicWidgetMessage = dynamic(
  () => import("../components/Messages/WidgetMessage"),
  {
    ssr: false,
  }
);

interface IProps {
  userData: User;
}

const Home: React.FC<IProps> = ({ userData }) => {
  useInitUser(userData);

  return (
    <div className="bg-neutral-100 dark:bg-zinc-900">
      <Navigation />
      <div className="mt-2 w-max inline">
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
        <DynamicWidgetMessage />
      </div>
    </div>
  );
};
export default Home;
export const getServerSideProps = withAuthSSP();
