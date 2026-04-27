import React from "react";
import NProgress from "nprogress";
import { Theme, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "nprogress/nprogress.css";
import "../styles/globals.css";
import "../styles/reaction.css";

import Router from "next/router";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";

import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DefaultSeo } from "next-seo";
import "../plugins/axios.plugin";
import SEO from "../../next-seo.config";
import { useStoreTheme } from "../store/state";
import { getCookie } from "cookies-next";
import { useOnlineHeartbeat } from "../hooks/useOnlineHeartbeat";
import { usePushSubscription } from "../hooks/usePushSubscription";
import { useThemeBootstrap } from "../hooks/useThemeBootstrap";
import ErrorBoundary from "../components/Share/ErrorBoundary";
import "../plugins/socket";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient());
  const { theme, setTheme } = useStoreTheme();

  const cookieToken = getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string)?.toString();

  useOnlineHeartbeat(cookieToken);
  usePushSubscription(cookieToken);
  useThemeBootstrap({
    theme,
    setTheme,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps?.dehydratedState}>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick={true}
          pauseOnHover={true}
          theme={theme ? (theme as Theme) : "light"}
        />
        <DefaultSeo {...SEO} />
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
      </HydrationBoundary>

      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
export default MyApp;
