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
  isOffcanvasOpen?: boolean;
  closeOffcanvas: () => void;
  setCurrentChat: (chat: any) => void;
  currentId?: string;
  allUsers: User[];
  onlineUsers?: User[];
}
const ChatUserSearchOffCanvas: React.FC<IProps> = ({
  isOffcanvasOpen,
  closeOffcanvas,
  setCurrentChat,
  currentId,
  allUsers,
  onlineUsers,
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
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleClick = async (user: User) => {
    const getConversations = async () => {
      try {
        const res = await axios.get(
          `/messenger/conversation?friendId=${user.id}`
        );
        setCurrentChat(res.data.conversation);
        toast(`${user.fullName} has been added to the conversation`);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  };
  return (
    <div
      className={`${
        !isOffcanvasOpen && "pointer-events-none"
      } fixed inset-0 overflow-hidden scrollbar-hide z-50`}>
      <div className="absolute inset-0 overflow-hidden scrollbar-hide">
        <div
          onClick={closeOffcanvas}
          className={`${
            isOffcanvasOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          } fixed inset-0 bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-30 transition-opacity`}></div>

        <div className="fixed inset-y-0 left-0 max-w-full flex">
          <div
            className={`${
              isOffcanvasOpen ? "translate-x-0" : "-translate-x-full"
            } transform transition ease-in-out duration-300 w-screen max-w-md`}>
            <div className="h-full flex flex-col bg-white dark:bg-black md:border-r border-gray-300 dark:border-zinc-700">
              <div className="min-h-0 flex-1 flex flex-col">
                {/* offcanvas head */}
                <div className="px-4 pt-6 pb-4 space-y-6 sticky border-b dark:border-b-zinc-700 top-0 z-10 bg-white dark:bg-black">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl tracking-wider">Search users</h2>
                    <div className="ml-3 h-7 flex items-center">
                      <button
                        onClick={closeOffcanvas}
                        className="bg-gray-100 dark:bg-zinc-800 hover:bg-opacity-60 dark:hover:bg-opacity-60 rounded-full p-3 focus:outline-none">
                        <BsXLg />
                      </button>
                    </div>
                  </div>
                </div>
                {/* offcanvas content */}
                <form
                  onSubmit={handleSubmit}
                  className="py-4 border-b dark:border-zinc-700 flex space-x-4 px-3">
                  <div className="flex-1 min-w-0">
                    <label htmlFor="search" className="sr-only">
                      Search
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        name="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        id="search"
                        className="block w-full bg-transparent pl-10 sm:text-sm border-gray-300 dark:border-zinc-700 rounded-md"
                        placeholder="Search"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex justify-center px-6 py-2 border border-gray-300 dark:border-zinc-700 shadow-sm text-sm font-medium rounded-md hover:bg-opacity-70">
                    <FiSearch className="h-5 w-5" />
                  </button>
                </form>

                {/* list */}
                {loading ? (
                  <UserListSkeleton />
                ) : (
                  <nav className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                    <div className="relative">
                      <ul className="relative z-0 divide-y divide-gray-200 dark:divide-zinc-700">
                        {searchResult
                          ? searchResult.map((user) => (
                              <li
                                key={user.id}
                                onClick={() => {
                                  handleClick(user);
                                  closeOffcanvas();
                                }}
                                className="px-4 py-4 flex items-center justify-between hover:bg-gray-200 dark:hover:bg-zinc-800 cursor-pointer">
                                <div className="flex items-center">
                                  {user.avatar ? (
                                    <Image
                                      src={
                                        user.avatar || "/images/user-avatar.png"
                                      }
                                      width={40}
                                      height={40}
                                      alt={user.fullName}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <div className="w-11 h-11 rounded-full object-cover mr-2 bg-gray-300 dark:bg-zinc-900">
                                      <RiUserSmileLine className="w-full h-full object-cover p-2" />
                                    </div>
                                  )}
                                  <div className="ml-3">
                                    <div className="text-sm leading-5 font-medium text-gray-900 dark:text-white">
                                      {user.fullName}
                                    </div>
                                    <div className="text-sm leading-5 text-gray-500 dark:text-gray-300">
                                      {user.username}
                                    </div>
                                  </div>
                                </div>
                              </li>
                            ))
                          : null}
                      </ul>
                    </div>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUserSearchOffCanvas;
