import { create } from "zustand";
import { User } from "../gql/graphql";

interface UserState {
  user: User;
  setUser: (userValue: User) => void;
}
export const useStoreUser = create<UserState>((set) => ({
  user: {
    id: "",
    fullName: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    avatar: "",
    phone: "",
    birthday: "",
    sex: false,
    createAt: "",
    updateAt: "",
    coverImage: "",
  },
  setUser: (userValue: User) => {
    set((state) => ({
      ...state,
      user: userValue,
    }));
  },
}));
