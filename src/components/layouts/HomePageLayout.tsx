import React from "react";
import Navbar from "../ui/navbar";
import MainContentContainer from "../common";
interface IProps {
  children?: React.ReactNode;
}

const HomePageLayout: React.FC<IProps> = (props) => {
  const { children } = props;
  return (
    <div className="w-full h-full flex flex-col">
      <Navbar />
      <MainContentContainer>{children}</MainContentContainer>
    </div>
  );
};

export default HomePageLayout;
