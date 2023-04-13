import React from "react";
import MessagingMain from "../components/Messages";
import { useStoreUser } from "../store/user";
import Login from "../components/Auth/Login";

const MessengerPage = () => {
  const { user } = useStoreUser();
  if (user.id !== "") {
    return <MessagingMain />;
  } else {
    return <Login />;
  }
};

export default MessengerPage;
