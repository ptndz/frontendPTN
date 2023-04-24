import React, { useEffect, useState } from "react";
import SingleFriends from "./SingleFriends";

import { User, IUser } from "../../gql/graphql";
import axios from "axios";
import { graphql } from "../../gql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { useStoreUser } from "../../store/user";

const AllFrends = () => {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useStoreUser();
  const [usersYouMayKnow, setUsersYouMayKnow] = useState<IUser[]>([]);
  const [friendRequest, setFriendRequest] = useState<IUser[]>([]);
  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (searchText !== "") {
    }
  };
  const queryGetUsersYouMayKnow = graphql(`
    query getUsersYouMayKnow {
      getUsersYouMayKnow {
        code
        success
        message
        users {
          id
          fullName
          avatar
          username
        }
        errors {
          message
          field
        }
      }
    }
  `);
  const queryFriendRequest = graphql(`
    query friendRequest {
      friendRequest {
        code
        success
        message
        users {
          id
          fullName
          avatar
          username
        }
        errors {
          message
          field
        }
      }
    }
  `);
  useEffect(() => {
    const getReceived = async () => {
      const res = await axios.get("/friends/me/received-requests");
      console.log(res.data);
    };

    const myFriends = async () => {
      const res = await axios.get("/friends/my");
      if (res.data.success) {
        setUsers(res.data.friends);
      }
      const resUsers = await graphQLClient.request(queryGetUsersYouMayKnow);
      if (graphQLClientErrorCheck(resUsers)) {
        if (resUsers.getUsersYouMayKnow.users) {
          const data = resUsers.getUsersYouMayKnow.users.filter((userData) => {
            return userData.id !== user.id;
          });
          setUsersYouMayKnow(data as IUser[]);
        }
      }

      const resFriendRequest = await graphQLClient.request(queryFriendRequest);
      if (graphQLClientErrorCheck(resFriendRequest)) {
        if (resFriendRequest.friendRequest.users) {
          const data = resFriendRequest.friendRequest.users.filter(
            (userData) => {
              return userData.id !== user.id;
            }
          );
          setFriendRequest(data as IUser[]);
        }
      }
    };
    myFriends();
  }, [queryGetUsersYouMayKnow, queryFriendRequest, user.id]);
  return (
    <div className=" pb-20">
      <div className="mx-8 md:mx-18 sm:mx-11 xs:mx-8 lg:mx-1 pt-5">
        <div className="bg-white dark:bg-black my-5 flex flex-col xs:flex-col sm:flex-row justify-between justify-items-center py-8 px-8 rounded-md">
          <div className="text-2xl font-bold pt-1.5 text-center mb-4 lg:mb-0 md:mb-0 sm:mb-0">
            Friends
          </div>

          <div className="flex justify-center justify-items-center">
            <div className=" bg-gray-100 w-72 h-12 rounded-lg relative">
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search here."
                  className="w-full h-12 block rounded-lg pl-4 text-lg border dark:border-zinc-600 outline-0 bg-gray-100 dark:bg-zinc-900 dark:text-white text-black"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 w-16 h-full rounded-full text-xl ">
                  <i className="fa-solid fa-magnifying-glass dark:text-white text-gray-700"></i>{" "}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-12 sm:grid-cols-12 md:grid-cols-12 gap-3">
          {users &&
            users.map((user) => (
              <SingleFriends key={user.username} user={user} />
            ))}
        </div>
      </div>
      <div className="mx-8 md:mx-18 sm:mx-11 xs:mx-8 lg:mx-1 pt-5">
        <div className="bg-white dark:bg-black my-5 flex flex-col xs:flex-col sm:flex-row justify-between justify-items-center py-8 px-8 rounded-md">
          <div className="text-2xl font-bold pt-1.5 text-center mb-4 lg:mb-0 md:mb-0 sm:mb-0">
            Friend Request
          </div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-12 sm:grid-cols-12 md:grid-cols-12 gap-3">
          {friendRequest &&
            friendRequest.map((user) => (
              <SingleFriends key={user.username} user={user as User} />
            ))}
        </div>
      </div>
      <div className="mx-8 md:mx-18 sm:mx-11 xs:mx-8 lg:mx-1 pt-5">
        <div className="bg-white dark:bg-black my-5 flex flex-col xs:flex-col sm:flex-row justify-between justify-items-center py-8 px-8 rounded-md">
          <div className="text-2xl font-bold pt-1.5 text-center mb-4 lg:mb-0 md:mb-0 sm:mb-0">
            You may know
          </div>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-12 sm:grid-cols-12 md:grid-cols-12 gap-3">
          {usersYouMayKnow &&
            usersYouMayKnow.map((user) => (
              <SingleFriends key={user.username} user={user as User} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default AllFrends;
