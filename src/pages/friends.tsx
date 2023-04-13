import React from "react";
import Navigation from "../components/Share/Navigation";
import AllFriends from "../components/FriendsCom/AllFriends";
import { useStoreUser } from "../store/user";
import Login from "../components/Auth/Login";

const Friends = () => {
  const { user } = useStoreUser();
  if (user.id !== "") {
    return (
      <>
        <Navigation />
        <div className="pt-2 w-full ">
          <div className="max-w-5xl w-full mx-auto">
            <AllFriends />
          </div>
        </div>
      </>
    );
  } else {
    return <Login />;
  }
};

export default Friends;
