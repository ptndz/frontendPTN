import React from "react";
import Navigation from "../components/Share/Navigation";
import AllFriends from "../components/FriendsCom/AllFriends";

const friends = () => {
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
};

export default friends;
