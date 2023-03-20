import { IStory } from "./stories";
export interface IPost {
  uuid: string;
  user: {
    fullName: string;
    username: string;
    avatar: string;
  };
  caption?: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}
export type TPostView = "gridView" | "listView";

export interface IPages {
  posts: IPost[];
  time: string;
  start: number;
}
export interface IProps {
  postsData: {
    pages: IPages[];
    pageParams: string;
  };
  storiesData: IStory[];
}
export interface IPostsData {
  pages: IPages[];
  pageParams: string;
}

export interface IPropsPostContainer {
  postsView?: TPostView;
  postsData: {
    pages: IPages[];
    pageParams: string;
  };
}
