import { IUser } from "../gql/graphql";
import { create } from "zustand";
interface IStateOpen {
  isOpen: boolean;
  id: number;
  user: IUser;
}

interface ChatWindowState {
  chatWindows: IStateOpen[] | undefined;
  setChatWindows: (chatWindow: IStateOpen) => void;
  setUpdatedWindows: (chatWindows: IStateOpen[]) => void;
}
export const useStoreChatWindow = create<ChatWindowState>((set) => ({
  chatWindows: [],
  setChatWindows: (chatWindow: IStateOpen) => {
    set((state) => {
      if (state.chatWindows) {
        const newState = updateObjectInState(state.chatWindows, chatWindow);
        return { ...state, chatWindows: newState };
      }
      return { ...state, chatWindows: [chatWindow] };
    });
  },
  setUpdatedWindows: (chatWindows: IStateOpen[]) => {
    set((state) => ({ ...state, chatWindows }));
  },
}));
function updateObjectInState(state: any, objectToUpdate: any) {
  if (state.length === 0) {
    return [objectToUpdate];
  }
  const foundObject = state.find((obj: any) => obj.id === objectToUpdate.id);
  if (!foundObject) {
    // Nếu không tìm thấy object có id tương ứng, thêm mới object vào mảng
    return [...state, objectToUpdate];
  } else {
    // Nếu tìm thấy object có id tương ứng, cập nhật object đó trong mảng
    const newState = state.map((obj: any) => {
      if (obj.id === objectToUpdate.id) {
        return objectToUpdate;
      } else {
        return obj;
      }
    });
    return newState;
  }
}
