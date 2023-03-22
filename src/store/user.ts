import { create } from "zustand";
import { IUser } from "../types/user";

interface UserState {
  user: IUser;
  setUser: (userValue: IUser) => void;
}
export const useStoreUser = create<UserState>((set) => ({
  user: {
    fullName: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",

    password: "",
    avatar: "https://random.imagecdn.app/200/200",
    phone: "",
    birthday: "",
    sex: false,
  },
  setUser: (userValue: IUser) => {
    set((state) => ({
      user: {
        ...state.user,
        userValue,
      },
    }));
  },
}));
