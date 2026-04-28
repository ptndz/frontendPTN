import Navigation from "../../components/Share/Navigation";
import Card from "../../components/Dashboard/Card";
import { FaUserCircle, FaUserFriends } from "react-icons/fa";
import { BsFileEarmarkPost } from "react-icons/bs";
import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../../gql/graphql";
import { withAuthSSP } from "../../lib/with-auth-ssp";
import { useInitUser } from "../../hooks/useInitUser";

interface IProps {
  userData: User;
}

const StatTile = ({
  icon,
  label,
  value,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
}) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
        {value}
        {suffix && <span className="text-sm font-normal text-gray-400 ml-1">{suffix}</span>}
      </p>
    </div>
  </div>
);

const PageDashboard: React.FC<IProps> = ({ userData }) => {
  const [numberUser, setNumberUser] = useState<number>(0);
  const [numberPost, setNumberPost] = useState<number>(0);
  const [numberFriend, setNumberFriend] = useState<number>(0);
  useInitUser(userData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resUser, resPost, resFriend] = await Promise.all([
          axios.get("/dashboard/user/all"),
          axios.get("/dashboard/post/all"),
          axios.get("/dashboard/friend/all"),
        ]);
        setNumberUser(resUser.data[1] as number);
        setNumberPost(resPost.data[1] as number);
        setNumberFriend(resFriend.data[1] as number);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overview of your platform metrics
          </p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatTile
            icon={<FaUserCircle className="w-6 h-6" />}
            label="Registered users"
            value={numberUser}
            suffix="/ 1000"
          />
          <StatTile
            icon={<BsFileEarmarkPost className="w-6 h-6" />}
            label="Total posts"
            value={numberPost}
          />
          <StatTile
            icon={<FaUserFriends className="w-6 h-6" />}
            label="Total friendships"
            value={numberFriend}
          />
        </div>

        {/* Detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            title="Project Referred"
            value={12}
            changePercent={22}
            rows={[
              { label: "Unique URL", value: 34, change: 22 },
              { label: "Embedded form", value: 13, change: 12 },
              { label: "New visitor", value: 45, change: 41 },
            ]}
          />
          <Card
            title="Project Paid"
            value={23}
            changePercent={12}
            rows={[
              { label: "User paid", value: 21, change: 20 },
              { label: "Income", value: 10, change: 2 },
              { label: "Royalties", value: 434, change: -12 },
            ]}
          />
          <Card
            title="New Features"
            value={12}
            changePercent={-2}
            rows={[
              { label: "Down", value: 34, change: -22 },
              { label: "Up", value: 13, change: 12 },
              { label: "Not developed", value: 45, change: -41 },
            ]}
          />
          <Card
            title="Sign-ins"
            value={16}
            changePercent={-14}
            rows={[
              { label: "America", value: 43, change: -12 },
              { label: "Europe", value: 133, change: 19 },
              { label: "Asia", value: 23, change: -4 },
            ]}
          />
          <Card
            title="Sales"
            value={9}
            changePercent={34}
            rows={[
              { label: "Templates", value: 345, change: -12 },
              { label: "Components", value: 139, change: 10 },
              { label: "Icons", value: 421, change: -4 },
            ]}
          />
          <Card
            title="Maintenance"
            value={15}
            changePercent={34}
            rows={[
              { label: "Cloud", value: 123, change: -22 },
              { label: "Infrastructure", value: 134, change: 9 },
              { label: "Office", value: 23, change: 41 },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default PageDashboard;
export const getServerSideProps = withAuthSSP();
