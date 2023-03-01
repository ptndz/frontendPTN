import React, { Fragment } from "react";

import { IPropsPostContainer } from "../../types/post";
import Post from "../post";

const PostContainer: React.FC<IPropsPostContainer> = (props) => {
  const { postsView, postsData } = props;
  return (
    <div className="mt-4 w-full h-full">
      <div
        className={`grid ${
          postsView === "gridView" ? "grid-cols-2" : "grid-cols-1"
        } gap-2`}
      >
        {/* {postsData.length ? (
          postsData.map((post, idx) => <Post key={idx} post={post} />)
        ) : (
          <p>No posts yet!</p>
        )} */}
        {postsData?.pages.map((data, i) => (
          <Fragment key={i}>
            {data.posts.map((post, i) => (
              <Post key={i} post={post} />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default PostContainer;
