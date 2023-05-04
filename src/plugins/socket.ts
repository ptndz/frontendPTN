import { getCookie } from "cookies-next";
import { io } from "socket.io-client";
const token = getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string);

const socket = io(process.env.NEXT_PUBLIC_BASE_URL_API as string, {
  autoConnect: true,
  auth: {
    token: token,
  },
});

export default socket;
