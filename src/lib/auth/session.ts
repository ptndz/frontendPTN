import { deleteCookie, getCookie, setCookie } from "cookies-next";

const ACCESS_TOKEN_COOKIE_FALLBACK = "accessToken";
const REFRESH_TOKEN_COOKIE_FALLBACK = "refreshToken";
const USER_ID_COOKIE_FALLBACK = "uuid";
const LEGACY_AUTH_COOKIE = "awt";

export const getAccessTokenCookieName = () =>
  process.env.NEXT_PUBLIC_COOKIE_NAME || ACCESS_TOKEN_COOKIE_FALLBACK;

export const getRefreshTokenCookieName = () =>
  process.env.NEXT_PUBLIC_REFRESH_TOKEN_COOKIE_NAME ||
  REFRESH_TOKEN_COOKIE_FALLBACK;

export const getAccessToken = () => getCookie(getAccessTokenCookieName());

export const getRefreshToken = () => getCookie(getRefreshTokenCookieName());

export const setAccessToken = (token: string, maxAge = 60 * 60 * 48) =>
  setCookie(getAccessTokenCookieName(), token, { maxAge });

export const setAuthCookies = (
  accessToken: string,
  refreshToken: string,
  userId: string,
  maxAge = 60 * 60 * 24 * 30
) => {
  setCookie(getAccessTokenCookieName(), accessToken, { maxAge });
  setCookie(getRefreshTokenCookieName(), refreshToken, { maxAge });
  setCookie(USER_ID_COOKIE_FALLBACK, userId, { maxAge });
};

export const clearAuthCookies = () => {
  deleteCookie(getAccessTokenCookieName());
  deleteCookie(getRefreshTokenCookieName());
  deleteCookie(USER_ID_COOKIE_FALLBACK);
  deleteCookie(LEGACY_AUTH_COOKIE);
};
