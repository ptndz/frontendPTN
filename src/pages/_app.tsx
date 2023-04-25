import React, { useEffect, useRef, useState } from "react";
import NProgress from "nprogress";
import { Theme, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";
import "nprogress/nprogress.css";
import "../styles/globals.css";
import "../styles/reaction.css";
import Router from "next/router";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";

import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DefaultSeo } from "next-seo";
import "../plugins/axios.plugin";
import SEO from "../../next-seo.config";
import { useStoreTheme } from "../store/state";
import { getThemeC, setThemeC } from "../plugins/theme";
import { getCookie, setCookie } from "cookies-next";

import axios from "axios";
import { base64ToUint8Array } from "../plugins/notification";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const queryClient = new QueryClient();
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  const { theme, setTheme } = useStoreTheme();

  const cookieToken = getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string);

  let interval = useRef<any>(null);
  useEffect(() => {
    if (cookieToken) {
      interval.current = setInterval(async () => {
        try {
          const res = await axios.put("/user/online");
          console.log("Last Online: ", res.data.lastOnline);
        } catch (error) {
          console.warn(error);
        }
      }, 300000);
    }
    return () => clearInterval(interval.current);
  }, [cookieToken]);

  useEffect(() => {
    if (cookieToken) {
      const postSubscribe = async (sub: any) => {
        try {
          await axios.post("/user/notification/subscription", {
            subscription: sub,
            agent: window.navigator.userAgent,
          });
        } catch (error) {
          console.warn(error);
        }
      };

      const getSubscribe = async () => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          const sub: any = await reg.pushManager.getSubscription();
          if (
            sub &&
            !(
              sub.expirationTime &&
              Date.now() > sub.expirationTime - 5 * 60 * 1000
            )
          ) {
            postSubscribe(sub);
            return;
          } else {
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: base64ToUint8Array(
                process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
              ),
            });
            postSubscribe(sub);
            return;
          }
        }
      };
      getSubscribe();
    }
  }, [cookieToken]);
  useEffect(() => {
    if (document) {
      const themeC = getThemeC();
      const d = document.documentElement;

      if (theme && themeC) {
        d.classList.remove("dark", "light");
        d.classList.add(theme);
        setThemeC(theme);
        setCookie("theme", theme);
        return;
      }

      if (themeC && theme === "") {
        d.classList.remove("dark", "light");
        d.classList.add(themeC);
        setTheme(themeC);
        setCookie("theme", themeC);
        return;
      }

      setTheme("light");
      setThemeC("light");
      setCookie("theme", "light");
      d.classList.add("light");
    }
  }, [setTheme, theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick={true}
          pauseOnHover={true}
          theme={theme ? (theme as Theme) : "light"}
        />
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </Hydrate>

      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
export default MyApp;
