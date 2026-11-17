import axios from "axios";
import { getCookie } from "cookies-next/client";
import socket from "./socket";
import {
  clearAuthCookies,
  getAccessTokenCookieName,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "../lib/auth/session";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL_API;

const isRefreshEndpoint = (url?: string): boolean =>
  typeof url === "string" &&
  (url.includes("/refresh_token") || url.includes("/auth/refresh-token"));

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    if (config && config.headers) {
      const token = getCookie(getAccessTokenCookieName());
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const originalConfig = error.config;
    if (error.response) {
      const status = error.response.status;
      if (isRefreshEndpoint(originalConfig?.url)) {
        if (status === 401 || status === 403 || status === 400) {
          clearAuthCookies();
        }
        return Promise.reject(error);
      }

      // Access Token was expired
      if (status === 401 && originalConfig && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          const newAccessToken = await refreshToken();
          if (originalConfig.headers) {
            originalConfig.headers["Authorization"] = `Bearer ${newAccessToken}`;
          }
          return axios(originalConfig);
        } catch (refreshError: any) {
          const refreshStatus = refreshError?.response?.status;
          if (
            refreshStatus === 401 ||
            refreshStatus === 403 ||
            refreshStatus === 400
          ) {
            clearAuthCookies();
          }
          return Promise.reject(refreshError);
        }
      }
      if (status === 400 && originalConfig && !originalConfig._retry) {
        originalConfig._retry = true;
        clearAuthCookies();

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

let inflightRefresh: Promise<string> | null = null;

export async function refreshToken(): Promise<string> {
  if (inflightRefresh) return inflightRefresh;
  inflightRefresh = (async () => {
    try {
      const currentRefreshToken = getRefreshToken();
      const rs = await axios.post("/refresh_token", {
        refreshToken: currentRefreshToken,
      });
      const { accessToken, refreshToken: nextRefreshToken } = rs.data;
      setAccessToken(accessToken);
      if (typeof nextRefreshToken === "string" && nextRefreshToken.length > 0) {
        setRefreshToken(nextRefreshToken);
      }
      if (socket.disconnected) socket.connect();
      return accessToken;
    } finally {
      inflightRefresh = null;
    }
  })();
  return inflightRefresh;
}
