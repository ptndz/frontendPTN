import { create } from "zustand";

interface IIsLoading {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useStoreIsLoading = create<IIsLoading>((set) => ({
  isLoading: false,
  setIsLoading: (isLoading: boolean) =>
    set((state) => ({ ...state, isLoading: isLoading })),
}));

interface IRegisterError {
  registerError: string;
  setRegisterError: (registerError: string) => void;
}

export const useStoreRegisterError = create<IRegisterError>((set) => ({
  registerError: "",
  setRegisterError: (registerError: string) =>
    set((state) => ({ ...state, registerError: registerError })),
}));
interface ITheme {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useStoreTheme = create<ITheme>((set) => ({
  theme: "",
  setTheme: (theme: string) => set((state) => ({ ...state, theme: theme })),
}));
