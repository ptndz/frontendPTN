import React from "react";

const UserListSkeleton = () => {
  return (
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-1/2 h-3 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="w-1/3 h-2.5 rounded bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserListSkeleton;
