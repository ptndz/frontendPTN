import React from 'react'

const UserListSkeleton = () => {
  return (
    <div className="space-y-3 flex-1 flex flex-col">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="p-3 px-5 w-full rounded-md mx-auto">
          <div className="flex w-full animate-pulse flex-row items-center justify-center space-x-5">
            <div className="w-12 bg-line h-12 rounded-full "></div>
            <div className="flex flex-col space-y-3 flex-1">
              <div className="w-full bg-line h-4 rounded-md "></div>
              <div className="w-2/3 bg-line h-4 rounded-md "></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserListSkeleton