import { getCookie, getCookies } from "cookies-next";

export const checkAuth = () => {
  const awt = getCookie("awt");

  if (awt) {
    return true;
  }
  return false;
};
