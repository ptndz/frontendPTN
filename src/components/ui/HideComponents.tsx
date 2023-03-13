import React from "react";

interface IProps {
  children?: React.ReactNode;
  isHide: boolean;
}

const HideComponents: React.FC<IProps> = (props) => {
  const { children, isHide } = props;
  return (
    <>
      {isHide ? (
        <div className="flex h-full animate-pulse flex-row items-center justify-center space-x-5 pt-3">
          <div className="flex flex-col space-y-3">
            <div className="h-12 w-80 rounded-md bg-gray-300" />
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default HideComponents;
