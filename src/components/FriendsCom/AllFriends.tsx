import React, { useEffect, useState } from "react";
import SingleFriends from "./SingleFriends";
import UserListSkeleton from "../Loaders/UserListSkeleton";

import { User, IUser } from "../../gql/graphql";
import axios from "axios";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { useStoreUser } from "../../store/user";
import { queryGetUsersYouMayKnow, queryFriendRequest } from "../../graphql/user";

const SectionHeader = ({ title, count }: { title: string; count: number }) => (
  <div className="flex items-center gap-3 mb-4">
    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
    {count > 0 && (
      <span className="h-6 min-w-6 px-2 rounded-full bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center">
        {count}
      </span>
    )}
  </div>
);

const AllFriends = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useStoreUser();
  const [usersYouMayKnow, setUsersYouMayKnow] = useState<IUser[]>([]);
  const [friendRequest, setFriendRequest] = useState<IUser[]>([]);

  useEffect(() => {
    const myFriends = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/friends/my");
        if (res.data.success) {
          setUsers(res.data.friends);
        }
        const resUsers = await graphQLClient.request(queryGetUsersYouMayKnow);
        if (graphQLClientErrorCheck(resUsers)) {
          if (resUsers.getUsersYouMayKnow.users) {
            const data = resUsers.getUsersYouMayKnow.users.filter(
              (userData) => userData.id !== user.id
            );
            setUsersYouMayKnow(data as IUser[]);
          }
        }

        const resFriendRequest = await graphQLClient.request(queryFriendRequest);
        if (graphQLClientErrorCheck(resFriendRequest)) {
          if (resFriendRequest.friendRequest.users) {
            const data = resFriendRequest.friendRequest.users.filter(
              (userData) => userData.id !== user.id
            );
            setFriendRequest(data as IUser[]);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    myFriends();
  }, [user.id]);

  return (
    <div className="space-y-8 pb-20">
      {/* My Friends */}
      <section>
        <SectionHeader title="My Friends" count={users.length} />
        {users.length === 0 && !loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No friends yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {users.map((u) => (
              <SingleFriends key={u.username} user={u} />
            ))}
          </div>
        )}
      </section>

      {/* Friend Requests */}
      <section>
        <SectionHeader title="Friend Requests" count={friendRequest.length} />
        {friendRequest.length === 0 && !loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No pending requests.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {friendRequest.map((u) => (
              <SingleFriends key={u.username} user={u as User} />
            ))}
          </div>
        )}
      </section>

      {/* People You May Know */}
      <section>
        <SectionHeader title="People you may know" count={usersYouMayKnow.length} />
        {loading ? (
          <UserListSkeleton />
        ) : usersYouMayKnow.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No suggestions right now.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {usersYouMayKnow.map((u) => (
              <SingleFriends key={u.username} user={u as User} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AllFriends;
