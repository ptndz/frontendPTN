import Navigation from "../../components/Share/Navigation";
import { FaUserCircle, FaUserFriends } from "react-icons/fa";
import { BsFileEarmarkPost } from "react-icons/bs";
import { useEffect, useState } from "react";
import axios from "axios";
import { GetServerSideProps } from "next";
import { getCookies } from "cookies-next";
import { graphQLServer } from "../../plugins/graphql.plugin";
import { queryUser } from "../../graphql/user";
import { User } from "../../gql/graphql";
import { useStoreUser } from "../../store/user";

interface IProps {
  userData: User;
}
const PageDashboard: React.FC<IProps> = ({ userData }) => {
  const [numberUser, serNumberUser] = useState<number>(0);
  const [numberPost, serNumberPost] = useState<number>(0);
  const [numberFriend, serNumberFriend] = useState<number>(0);
  const { setUser } = useStoreUser();

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [setUser, userData]);

  useEffect(() => {
    const fetchData = async () => {
      const resUser = await axios.get("/dashboard/user/all");
      serNumberUser(resUser.data[1] as number);
      const resPost = await axios.get("/dashboard/post/all");
      serNumberPost(resPost.data[1] as number);
      const resFriend = await axios.get("/dashboard/friend/all");
      serNumberFriend(resFriend.data[1] as number);
    };
    fetchData();
  }, []);

  return (
    <main className="relative h-screen overflow-hidden bg-gray-100 dark:bg-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex flex-col w-full md:space-y-4">
          <div className="h-screen px-4 pb-24 overflow-auto md:px-6">
            <Navigation />

            <div className="flex flex-col items-center w-full my-6 space-y-4 md:space-x-4 md:space-y-0 md:flex-row">
              <div className="w-full md:w-6/12">
                <div className="relative w-full overflow-hidden bg-white shadow-lg dark:bg-gray-700">
                  <a href="#" className="block w-full h-full">
                    <div className="flex items-center justify-between px-4 py-6 space-x-4">
                      <div className="flex items-center">
                        <FaUserCircle className="w-10 h-10" />
                        <p className="ml-2 text-sm font-semibold text-gray-700 border-b border-gray-200 dark:text-white">
                          Registered user
                        </p>
                      </div>
                      <div className="mt-6 text-xl font-bold text-black border-b border-gray-200 md:mt-0 dark:text-white">
                        {numberUser}
                        <span className="text-xs text-gray-400">/1000</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-gray-100">
                      <div className="w-1/5 h-full text-xs text-center text-white bg-green-400"></div>
                    </div>
                  </a>
                </div>
              </div>
              <div className="flex items-center w-full space-x-4 md:w-1/2">
                <div className="w-1/2">
                  <div className="relative w-full px-4 py-6 bg-white shadow-lg dark:bg-gray-700">
                    <p className="text-2xl font-bold text-black dark:text-white">
                      {numberPost}
                    </p>
                    <p className="text-sm text-gray-400">Posts</p>
                    <span className="absolute p-4 rounded-full top-2 right-4">
                      <BsFileEarmarkPost className="w-10 h-10" />
                    </span>
                  </div>
                </div>
                <div className="w-1/2">
                  <div className="relative w-full px-4 py-6 bg-white shadow-lg dark:bg-gray-700">
                    <p className="text-2xl font-bold text-black dark:text-white">
                      {numberFriend}
                    </p>
                    <p className="text-sm text-gray-400">Number of friends</p>
                    <span className="absolute p-4 rounded-full top-2 right-4">
                      <FaUserFriends className="w-10 h-10" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 my-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="w-full">
                <div className="relative w-full px-4 py-6 bg-white shadow-lg dark:bg-gray-700">
                  <p className="text-sm font-semibold text-gray-700 border-b border-gray-200 w-max dark:text-white">
                    Project Reffered
                  </p>
                  <div className="flex items-end my-6 space-x-2">
                    <p className="text-5xl font-bold text-black dark:text-white">
                      12
                    </p>
                    <span className="flex items-center text-xl font-bold text-green-500">
                      <svg
                        width={20}
                        fill="currentColor"
                        height={20}
                        className="h-3"
                        viewBox="0 0 1792 1792"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                      </svg>
                      22%
                    </span>
                  </div>
                  <div className="dark:text-white">
                    <div className="flex items-center justify-between pb-2 mb-2 text-sm border-b border-gray-200 sm:space-x-12">
                      <p>Unique URL</p>
                      <div className="flex items-end text-xs">
                        34
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-green-500"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          22%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-2 mb-2 space-x-12 text-sm border-b border-gray-200 md:space-x-24">
                      <p>Embedded form</p>
                      <div className="flex items-end text-xs">
                        13
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-green-500"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          12%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between space-x-12 text-sm md:space-x-24">
                      <p>New visitor</p>
                      <div className="flex items-end text-xs">
                        45
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-green-500"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          41%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="relative w-full px-4 py-6 bg-white shadow-lg dark:bg-gray-700">
                  <p className="text-sm font-semibold text-gray-700 border-b border-gray-200 w-max dark:text-white">
                    Project Paid
                  </p>
                  <div className="flex items-end my-6 space-x-2">
                    <p className="text-5xl font-bold text-black dark:text-white">
                      23
                    </p>
                    <span className="flex items-center text-xl font-bold text-green-500">
                      <svg
                        width={20}
                        fill="currentColor"
                        height={20}
                        className="h-3"
                        viewBox="0 0 1792 1792"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                      </svg>
                      12%
                    </span>
                  </div>
                  <div className="dark:text-white">
                    <div className="flex items-center justify-between pb-2 mb-2 space-x-12 text-sm border-b border-gray-200 md:space-x-24">
                      <p>User paid</p>
                      <div className="flex items-end text-xs">
                        21
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-green-500"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          20%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-2 mb-2 space-x-12 text-sm border-b border-gray-200 md:space-x-24">
                      <p>Income</p>
                      <div className="flex items-end text-xs">
                        10
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-green-500"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          2%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between space-x-12 text-sm md:space-x-24">
                      <p>Royal tees</p>
                      <div className="flex items-end text-xs">
                        434
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-red-500 transform rotate-180"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          12%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="relative w-full px-4 py-6 bg-white shadow-lg dark:bg-gray-700">
                  <p className="text-sm font-semibold text-gray-700 border-b border-gray-200 w-max dark:text-white">
                    New features
                  </p>
                  <div className="flex items-end my-6 space-x-2">
                    <p className="text-5xl font-bold text-black dark:text-white">
                      12
                    </p>
                    <span className="flex items-center text-xl font-bold text-red-500">
                      <svg
                        width={20}
                        fill="currentColor"
                        height={20}
                        className="h-3 transform rotate-180"
                        viewBox="0 0 1792 1792"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                      </svg>
                      2%
                    </span>
                  </div>
                  <div className="dark:text-white">
                    <div className="flex items-center justify-between pb-2 mb-2 space-x-12 text-sm border-b border-gray-200 md:space-x-24">
                      <p>Down</p>
                      <div className="flex items-end text-xs">
                        34
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-red-500 transform rotate-180"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          22%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-2 mb-2 space-x-12 text-sm border-b border-gray-200 md:space-x-24">
                      <p>Up</p>
                      <div className="flex items-end text-xs">
                        13
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-green-500"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          12%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between space-x-12 text-sm md:space-x-24">
                      <p>No developed</p>
                      <div className="flex items-end text-xs">
                        45
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-red-500 transform rotate-180"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          41%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="relative w-full px-4 py-6 bg-white shadow-lg dark:bg-gray-700">
                  <p className="text-sm font-semibold text-gray-700 border-b border-gray-200 w-max dark:text-white">
                    Sign in
                  </p>
                  <div className="flex items-end my-6 space-x-2">
                    <p className="text-5xl font-bold text-black dark:text-white">
                      16
                    </p>
                    <span className="flex items-center text-xl font-bold text-red-500">
                      <svg
                        width={20}
                        fill="currentColor"
                        height={20}
                        className="h-3 transform rotate-180"
                        viewBox="0 0 1792 1792"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                      </svg>
                      14%
                    </span>
                  </div>
                  <div className="dark:text-white">
                    <div className="flex items-center justify-between pb-2 mb-2 space-x-12 text-sm border-b border-gray-200 md:space-x-24">
                      <p>Amercia</p>
                      <div className="flex items-end text-xs">
                        43
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-red-500 transform rotate-180"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          12%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-2 mb-2 space-x-12 text-sm border-b border-gray-200 md:space-x-24">
                      <p>Europe</p>
                      <div className="flex items-end text-xs">
                        133
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-green-500"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          19%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between space-x-12 text-sm md:space-x-24">
                      <p>Asia</p>
                      <div className="flex items-end text-xs">
                        23
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-red-500 transform rotate-180"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          4%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="relative w-full px-4 py-6 bg-white shadow-lg dark:bg-gray-700">
                  <p className="text-sm font-semibold text-gray-700 border-b border-gray-200 w-max dark:text-white">
                    Sales
                  </p>
                  <div className="flex items-end my-6 space-x-2">
                    <p className="text-5xl font-bold text-black dark:text-white">
                      9
                    </p>
                    <span className="flex items-center text-xl font-bold text-green-500">
                      <svg
                        width={20}
                        fill="currentColor"
                        height={20}
                        className="h-3"
                        viewBox="0 0 1792 1792"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                      </svg>
                      34%
                    </span>
                  </div>
                  <div className="dark:text-white">
                    <div className="flex items-center justify-between pb-2 mb-2 space-x-12 text-sm border-b border-gray-200 md:space-x-24">
                      <p>Templates</p>
                      <div className="flex items-end text-xs">
                        345
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-red-500 transform rotate-180"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          12%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-2 mb-2 space-x-12 text-sm border-b border-gray-200 md:space-x-24">
                      <p>Components</p>
                      <div className="flex items-end text-xs">
                        139
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-green-500"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          10%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between space-x-12 text-sm md:space-x-24">
                      <p>Icons</p>
                      <div className="flex items-end text-xs">
                        421
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-red-500 transform rotate-180"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          4%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <div className="relative w-full px-4 py-6 bg-white shadow-lg dark:bg-gray-700">
                  <p className="text-sm font-semibold text-gray-700 border-b border-gray-200 w-max dark:text-white">
                    Maintenance
                  </p>
                  <div className="flex items-end my-6 space-x-2">
                    <p className="text-5xl font-bold text-black dark:text-white">
                      15
                    </p>
                    <span className="flex items-center text-xl font-bold text-green-500">
                      <svg
                        width={20}
                        fill="currentColor"
                        height={20}
                        className="h-3"
                        viewBox="0 0 1792 1792"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                      </svg>
                      34%
                    </span>
                  </div>
                  <div className="dark:text-white">
                    <div className="flex items-center justify-between pb-2 mb-2 space-x-12 text-sm border-b border-gray-200 md:space-x-24">
                      <p>Cloud</p>
                      <div className="flex items-end text-xs">
                        123
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-red-500 transform rotate-180"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          22%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pb-2 mb-2 space-x-12 text-sm border-b border-gray-200 md:space-x-24">
                      <p>Infra</p>
                      <div className="flex items-end text-xs">
                        134
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-green-500"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          9%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between space-x-12 text-sm md:space-x-24">
                      <p>Office</p>
                      <div className="flex items-end text-xs">
                        23
                        <span className="flex items-center">
                          <svg
                            width={20}
                            fill="currentColor"
                            height={20}
                            className="h-3 text-green-500"
                            viewBox="0 0 1792 1792"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M1675 971q0 51-37 90l-75 75q-38 38-91 38-54 0-90-38l-294-293v704q0 52-37.5 84.5t-90.5 32.5h-128q-53 0-90.5-32.5t-37.5-84.5v-704l-294 293q-36 38-90 38t-90-38l-75-75q-38-38-38-90 0-53 38-91l651-651q35-37 90-37 54 0 91 37l651 651q37 39 37 91z"></path>
                          </svg>
                          41%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PageDashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const cookie = getCookies({ req: context.req });
    const accessToken = cookie[process.env.NEXT_PUBLIC_COOKIE_NAME as string];
    if (accessToken) {
      const res = await graphQLServer(
        context.req.headers.cookie,
        accessToken
      ).request(queryUser);
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
