import axios from "axios";

import create from "zustand";
export interface IPost {
    _id: string;
    user: {
      _id: string;
      fullname: string;
      username: string;
      dp: string;
    };
    caption?: string;
    image?: string;
    likes: number;
    comments: number;
    shares: number;
    createdAt: Date;
    updatedAt: Date;
  }
interface PostState{
    post: IPost[];
    setPost: (postData: IPost[]) => void;
}
export const useStorePost =create<PostState>((set) => ({
    post: [],
    setPost: (postData: IPost[]) => {
      set((state) => ({
        ...state,
        post: postData,
      }));
    },
  }))