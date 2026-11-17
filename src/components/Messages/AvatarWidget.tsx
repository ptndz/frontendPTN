import { IUser } from "../../gql/graphql";
import { Avatar } from "@astryxdesign/core/Avatar";
interface IProps {
  userData: IUser;
  onClick: () => void;
}
const AvatarWidget: React.FC<IProps> = ({ userData, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-surface rounded-xl shadow-md p-2 focus:outline-none">
      <Avatar
        src={userData.avatar}
        fallbackSrc="/images/user-avatar.png"
        name={userData.fullName}
        size={60}
        tooltip={userData.fullName}
      />
    </button>
  );
};

export default AvatarWidget;
