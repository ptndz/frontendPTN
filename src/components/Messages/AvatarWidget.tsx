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
    <div className="flex items-center space-x-2">
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden h-20 w-20`}>
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100">
          <button className="focus:outline-none" onClick={onClick}>
            <div>
              <div className="relative flex items-center justify-center w-14 h-14">
                <Image
                  id={`app-title${userData.id}`}
                  className="w-14 h-14 rounded-full"
                  src={userData.avatar}
                  alt={userData.fullName}
                  width={100}
                  height={100}
                />
                {false && (
                  <div className="absolute top-0 right-0 px-1 bg-red-500 rounded-full text-white text-sm">
                    {1}
                  </div>
                )}
              </div>
              <ReactTooltip
                anchorId={`app-title${userData.id}`}
                place="left"
                content={userData.fullName}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarWidget;
