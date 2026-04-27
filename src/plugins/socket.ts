import { getCookie } from "cookies-next";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_BASE_URL_API as string, {
  autoConnect: true,
  auth: (cb) => {
    cb({ token: getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string) });
  },
});

export default socket;
