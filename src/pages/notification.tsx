import Navigation from "../components/Share/Navigation";
import { BsBell } from "react-icons/bs";
import { User } from "../gql/graphql";
import { withAuthSSP } from "../lib/with-auth-ssp";
import { useInitUser } from "../hooks/useInitUser";
import dynamic from "next/dynamic";

const DynamicWidgetMessage = dynamic(
  () => import("../components/Messages/WidgetMessage"),
  { ssr: false }
);

interface IProps {
  userData: User;
}

const Notification: React.FC<IProps> = ({ userData }) => {
  useInitUser(userData);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <BsBell className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
            <BsBell className="w-7 h-7 text-gray-400" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-gray-100">No notifications yet</p>
          <p className="text-sm text-gray-400">
            When you get notifications, they&apos;ll appear here.
          </p>
        </div>
      </div>
      <DynamicWidgetMessage />
    </div>
  );
};

export default Notification;
export const getServerSideProps = withAuthSSP();
