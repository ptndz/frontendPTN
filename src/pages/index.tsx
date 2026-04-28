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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-5">
          {/* Left sidebar */}
          <aside className="col-span-3 hidden lg:block h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide sticky top-[57px]">
            <LeftSideBar />
          </aside>

          {/* Main feed */}
          <main className="col-span-12 lg:col-span-6 h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide">
            <MiddleLeftBar />
          </main>

          {/* Right sidebar */}
          <aside className="col-span-3 hidden lg:block h-[calc(100vh-72px)] overflow-y-auto scrollbar-hide sticky top-[57px]">
            <RightSideBar />
          </aside>
        </div>
      </div>
      <DynamicWidgetMessage />
    </div>
  );
};
export default Home;
export const getServerSideProps = withAuthSSP();
