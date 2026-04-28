import { IUser } from "../../gql/graphql";
import Image from "next/image";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip as ReactTooltip } from "react-tooltip";

interface IProps {
  userData: IUser;
  onClick: () => void;
}

const AvatarWidget: React.FC<IProps> = ({ userData, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="relative group focus:outline-none"
      id={`app-title${userData.id}`}
    >
      <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-900 shadow-lg hover:ring-emerald-500 transition-all">
        <Image
          fill
          className="object-cover"
          src={userData.avatar}
          alt={userData.fullName || ""}
        />
      </div>
      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
      <ReactTooltip
        anchorId={`app-title${userData.id}`}
        place="left"
        content={userData.fullName || ""}
      />
    </button>
  );
};

export default AvatarWidget;
