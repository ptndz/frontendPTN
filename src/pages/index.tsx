import LeftSideBar from "../components/Home/LeftSideBar";
import MiddleLeftBar from "../components/Home/MiddleLeftBar";
import MiddleRightBar from "../components/Home/MiddleRightBar";
import RightSideBar from "../components/Home/RightSideBar";
import Navigation from "../components/Share/Navigation";

import Login from "./login";

import { useStoreUser } from "../store/user";
import { useStoreIsLoading } from "../store/state";
import { useEffect } from "react";
import { graphql } from "../gql";
import { graphQLClient } from "../plugins/graphql.plugin";

export default function Home() {
  const { user } = useStoreUser();
  const { isLoading } = useStoreIsLoading();

  if (isLoading) {
    return (
      <div className="text-center h-screen flex justify-center items-center">
        <button
          disabled
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center">
          <svg
            role="status"
            className="inline mr-3 w-4 h-4 text-white animate-spin"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9184 73.1895 90.9184 50.5908C90.9184 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#E5E7EB"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8424 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8442 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 84.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentColor"
            />
          </svg>
          Loading...
        </button>
      </div>
    );
  }

  if (user) {
    return (
      <div className="bg-neutral-100 dark:bg-zinc-900">
        <Navigation />
        <div className="mt-2">
          <div className="grid grid-cols-12 mx-auto 2xl:max-w-[1560px] gap-6">
            <div className="col-span-3 max-w-2xl hidden lg:block h-[89vh] overflow-y-scroll scrollbar	scrollbar-hide hover:scrollbar-default px-2">
              <LeftSideBar />
            </div>
            <div className="col-span-12 lg:col-span-6 w-full mx-auto h-[89vh] scrollbar-hide overflow-y-scroll scrollbar scroll-ml-5">
              {/* <div className="grid gap-5 grid-cols-12 pr-3"> */}
              <div className="col-span-12 max-w-2xl mx-auto">
                <MiddleLeftBar />
              </div>
              {/* <div className="col-span-4 hidden xl:block">
                  <MiddleRightBar />
                </div> */}
              {/* </div> */}
            </div>
            <div className="col-span-3 max-w-2xl hidden lg:block h-[89vh] overflow-y-scroll scrollbar	scrollbar-hide hover:scrollbar-default px-2">
              <RightSideBar />
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <Login />;
  }
}