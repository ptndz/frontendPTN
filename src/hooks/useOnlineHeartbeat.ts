import { useEffect, useRef } from "react";
import axios from "axios";

export const useOnlineHeartbeat = (cookieToken: string | undefined) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!cookieToken) return;

    intervalRef.current = setInterval(async () => {
      try {
        const res = await axios.put("/user/online");
        console.log("Last Online: ", res.data.lastOnline);
      } catch (error) {
        console.warn(error);
      }
    }, 300000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cookieToken]);
};
