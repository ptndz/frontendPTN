import axios from "axios";
import { getCookie } from "cookies-next";
import {
  clearAuthCookies,
  getRefreshToken,
  setAccessToken,
} from "../lib/auth/session";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_BASE_URL_API;

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    if (config && config.headers) {
      const token = getCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  function (error) {
    // Do something with request error

    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  async function (error) {
    const originalConfig = error.config;
    if (error.response) {
      // Access Token was expired
      if (error.response.status === 401 && !originalConfig._retry) {
        originalConfig._retry = true;

        try {
          await refreshToken();
          return axios(originalConfig);
        } catch (_error) {
          console.log(_error);

          return Promise.reject(_error);
        }
      }
      if (error.response.status === 400 && !originalConfig._retry) {
        originalConfig._retry = true;
        clearAuthCookies();

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export async function refreshToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  const rs = await axios.post("/refresh_token", {
    refreshToken: refreshToken,
  });
  const { accessToken } = rs.data;
  setAccessToken(accessToken);
  return accessToken;
}
