import React from "react";

const PostSkeleton = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="flex-1 space-y-2">
          <div className="w-32 h-3 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="w-20 h-2.5 rounded bg-gray-100 dark:bg-gray-800" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="w-full h-3 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="w-3/4 h-3 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="w-full h-48 rounded-xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
};

export default PostSkeleton;
