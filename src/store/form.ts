import { create } from "zustand";
import { IUser } from "../types/user";

interface FormRegister {
  user: IUser;
  //   setFullName: (name: string) => void;
  //   setUserName: (username: string) => void;
  //   setEmail: (email: string) => void;
  //   setPassword: (password: string) => void;
  //   setPhone: (phone: string) => void;
  setUser: (keyValue: string, value: string | boolean) => void;
}
export const useStoreFormRegister = create<FormRegister>((set) => ({
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
  setUser: (keyValue: string, value: string | boolean) => {
    set((state) => ({
      user: {
        ...state.user,
        [keyValue]: value,
      },
    }));
  },
  //   setFullName: (name: string) => {
  //     set((state) => ({
  //       user: {
  //         ...state.user,
  //         fullname: name,
  //       },
  //     }));
  //   },
  //   setUserName: (username: string) => {
  //     set((state) => ({
  //         user:{
  //             ...state.user,
  //             username:username
  //           }
  //     }));
  //   },
  //   setEmail: (email: string) => {
  //     set((state) => ({
  //         user:{
  //             ...state.user,
  //             email:email
  //         }
  //     }));
  //   },
  //   setPassword: (password: string) => {
  //     set((state) => ({
  //         user:{
  //             ...state.user,
  //             password:password
  //         }
  //     }));
  //   },
  //   setPhone: (phone: string) => {
  //     set((state) => ({
  //         user:{
  //             ...state.user,
  //             phone:phone
  //         }
  //     }));
  //   },
}));
