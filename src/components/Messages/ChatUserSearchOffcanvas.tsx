import { BsXLg } from "react-icons/bs";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";
import { RiUserSmileLine } from "react-icons/ri";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import UserListSkeleton from "../Loaders/UserListSkeleton";
import { User } from "../../gql/graphql";

interface IProps {
  isOffCanvasOpen?: boolean;
  closeOffCanvas: () => void;
  setCurrentChat: (chat: any) => void;
  currentId?: string;
  allUsers: User[];
}

const ChatUserSearchOffCanvas: React.FC<IProps> = ({
  isOffCanvasOpen,
  closeOffCanvas,
  setCurrentChat,
}) => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<User[]>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    if (search !== "") {
      try {
        const res = await axios.get(`/user/search?keyword=${search}`);
        setSearchResult(res.data.users);
      } catch (err) {
        console.log(err);
      }
    }
    setLoading(false);
  };

  const handleClick = async (user: User) => {
    try {
      const res = await axios.get(`/messenger/conversation?friendId=${user.id}`);
      setCurrentChat(res.data.conversation);
      toast(`${user.fullName} added to conversation`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className={`${
        !isOffCanvasOpen && "pointer-events-none"
      } fixed inset-0 z-50`}
    >
      {/* Backdrop */}
      <div
        onClick={closeOffCanvas}
        className={`${
          isOffCanvasOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity`}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div
          className={`${
            isOffCanvasOpen ? "translate-x-0" : "-translate-x-full"
          } transform transition-transform ease-in-out duration-300 w-screen max-w-md`}
        >
          <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Find people</h2>
              <button
                onClick={closeOffCanvas}
                className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                <BsXLg className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Search */}
            <form onSubmit={handleSubmit} className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or username..."
                  className="w-full h-10 pl-10 pr-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                />
              </div>
            </form>

            {/* Results */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
              {loading ? (
                <UserListSkeleton />
              ) : searchResult && searchResult.length > 0 ? (
                <ul className="space-y-1">
                  {searchResult.map((user) => (
                    <li
                      key={user.id}
                      onClick={() => {
                        handleClick(user);
                        closeOffCanvas();
                      }}
                      className="px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-3 transition-colors"
                    >
                      {user.avatar ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={user.avatar}
                            fill
                            alt={user.fullName || ""}
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <RiUserSmileLine className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-400 truncate">@{user.username}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : search ? (
                <div className="text-center py-12 px-4">
                  <p className="text-sm text-gray-400">No users found for &ldquo;{search}&rdquo;</p>
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <p className="text-sm text-gray-400">Search for people to start a conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUserSearchOffCanvas;
