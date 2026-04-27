import { useEffect } from "react";
import axios from "axios";
import { base64ToUint8Array } from "../plugins/notification";

export const usePushSubscription = (cookieToken: string | undefined) => {
  useEffect(() => {
    if (!cookieToken) return;

    const postSubscribe = async (subscription: PushSubscription) => {
      try {
        await axios.post("/user/notification/subscription", {
          subscription,
          agent: window.navigator.userAgent,
        });
      } catch (error) {
        console.warn(error);
      }
    };

    const getSubscribe = async () => {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg) return;
        const currentPermission = Notification.permission;

        if (currentPermission === "denied") return;

        const permission =
          currentPermission === "granted"
            ? currentPermission
            : await Notification.requestPermission();

        if (permission !== "granted") return;

        const existedSub = await reg.pushManager.getSubscription();
        const isSubExpired =
          existedSub?.expirationTime != null &&
          Date.now() > existedSub.expirationTime - 5 * 60 * 1000;

        if (existedSub && !isSubExpired) {
          await postSubscribe(existedSub);
          return;
        }

        const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
        if (!publicKey) {
          console.warn("NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY is missing.");
          return;
        }

        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(publicKey),
        });

        await postSubscribe(subscription);
      } catch (error) {
        console.warn(error);
      }
    };

    getSubscribe();
  }, [cookieToken]);
};
