import { create } from "zustand";
import { IPost } from "../types/post";
interface PostState {
  post: IPost[];
  setPost: (postData: IPost[]) => void;
}
export const useStorePost = create<PostState>((set) => ({
  post: [],
  setPost: (postData: IPost[]) => {
    set((state) => ({
      ...state,
      post: postData,
    }));
  },
}));
