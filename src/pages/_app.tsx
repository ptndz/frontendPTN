import React, { useEffect } from "react";
import NProgress from "nprogress";
import { Theme, ToastContainer, toast } from "react-toastify";
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
import { setCookies } from "cookies-next";
import { useStoreUser } from "../store/user";
import { graphql } from "../gql";
import { graphQLClient } from "../plugins/graphql.plugin";

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const queryClient = new QueryClient();
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps }: AppProps) {
  const { theme, setTheme } = useStoreTheme();
  const { user, setUser } = useStoreUser();
  const queryUser = graphql(`
    query user {
      user {
        code
        success
        message
        user {
          id
          fullName
          lastName
          firstName
          username
          email
          avatar
          coverImage
          phone
          birthday
          sex
          createAt
          updateAt
        }
        errors {
          message
          field
        }
      }
    }
  `);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const resUser = await graphQLClient.request(queryUser);
        if (resUser.user.code === 400) {
          toast.error(resUser.user.message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            theme: theme ? (theme as Theme) : "light",
          });
        }
        if (resUser.user.code === 200) {
          if (resUser.user.user) {
            setUser(resUser.user.user);
          }
        }
      } catch (error) {
        console.log("Error: Not authenticated to perform GraphQL request");
      }
    };
    fetchUser();
  }, [queryUser, setUser, theme, user.username]);

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
