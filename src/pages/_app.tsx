import React from "react";
import NProgress from "nprogress";
import { Theme, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "nprogress/nprogress.css";
import "../styles/globals.css";
/* Mono theme CSS — imported here (the Custom App) on purpose:
   Next.js Pages Router forbids global CSS imports from any other file, so
   the `theme add`-generated CSS imports were moved here from
   src/astryx-themes.ts (see the note there). */
import "../themes/mono/mono.css";
import "../themes/mono/mono.fonts.css";
import "../styles/reaction.css";

import Router from "next/router";
import Link from "next/link";
import type { AppProps } from "next/app";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";

/* Astryx theme provider (Pages Router adaptation of the App Router
   providers.tsx from the core README): Theme + LinkProvider wrap the
   whole app. The theme is the app's own Mono theme
   (src/themes/mono, built + registered via `theme add`, default via
   `theme use mono`); its `mode` follows the app's theme store, so the
   Astryx dark mode and the Tailwind `.dark` class (set by
   useThemeBootstrap from the same store) always switch together.
   Pages Router note: _app.tsx imports the built theme JS + CSS directly
   (paired in this file). src/astryx-themes.ts is the CLI-generated
   registry — kept byte-pristine for `astryx doctor` and NOT imported:
   importing it would pull its CSS imports into the bundle and break
   `next build` ("Global CSS cannot be imported from files other than
   your Custom <App>"). Do not re-route the theme through it. */
import {Theme as AstryxTheme} from "@astryxdesign/core/theme";
import {LinkProvider} from "@astryxdesign/core/Link";
import {monoTheme} from "../themes/mono/mono.js";

import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import dynamic from "next/dynamic";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then(
            (m) => m.ReactQueryDevtools
          ),
        { ssr: false }
      )
    : () => null;
import { generateDefaultSeo } from "next-seo/pages";
import "../plugins/axios.plugin";
import SEO from "../../next-seo.config";
import { useStoreTheme } from "../store/state";
import { getCookie } from "cookies-next/client";
import { useOnlineHeartbeat } from "../hooks/useOnlineHeartbeat";
import { usePushSubscription } from "../hooks/usePushSubscription";
import { useThemeBootstrap } from "../hooks/useThemeBootstrap";
import CallProvider from "../components/Messages/CallProvider";
import { I18nProvider } from "../i18n/I18nProvider";
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
    <AstryxTheme theme={monoTheme} mode={theme === "dark" ? "dark" : "light"}>
    <LinkProvider component={Link}>
    <I18nProvider>
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
        {generateDefaultSeo(SEO)}
        <Component {...pageProps} />
        <CallProvider />
      </HydrationBoundary>

      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
    </I18nProvider>
    </LinkProvider>
    </AstryxTheme>
  );
}
export default MyApp;
