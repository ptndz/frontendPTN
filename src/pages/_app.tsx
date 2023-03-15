import React from "react";

import "../styles/globals.css";
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

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  //const [queryClient] = React.useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </Hydrate>

      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default MyApp;
