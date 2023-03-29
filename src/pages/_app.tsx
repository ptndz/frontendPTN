import React, { useEffect } from "react";
import NProgress from "nprogress";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";
import "nprogress/nprogress.css";
import "../styles/globals.css";
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
import { setCookies } from "cookies-next";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const queryClient = new QueryClient();
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  const { theme, setTheme } = useStoreTheme();

  useEffect(() => {
    if (document) {
      const themeC = getThemeC();
      const d = document.documentElement;

      if (theme && themeC) {
        d.classList.remove("dark", "light");
        d.classList.add(theme);
        setThemeC(theme);
        setCookies("theme", theme);
        return;
      }

      if (themeC && theme === "") {
        d.classList.remove("dark", "light");
        d.classList.add(themeC);
        setTheme(themeC);
        setCookies("theme", themeC);
        return;
      }

      setTheme("light");
      setThemeC("light");
      setCookies("theme", "light");
      d.classList.add("light");
    }
  }, [setTheme, theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ToastContainer />
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </Hydrate>

      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default MyApp;
