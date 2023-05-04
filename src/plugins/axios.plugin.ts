import axios from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

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
        deleteCookie("accessToken");
        deleteCookie("uuid");
        deleteCookie("awt");

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export async function refreshToken(): Promise<string> {
  const refreshToken = getCookie(
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME as string
  );
  const rs = await axios.post("/refresh_token", {
    refreshToken: refreshToken,
  });
  const { accessToken } = rs.data;
  setCookie(process.env.NEXT_PUBLIC_COOKIE_NAME as string, accessToken, {
    maxAge: 60 * 60 * 48,
  });
  return accessToken;
}
