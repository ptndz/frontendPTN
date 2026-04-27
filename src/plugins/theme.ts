export const isServer = typeof window === "undefined";
export function setThemeC(value: string) {
  try {
    localStorage.setItem("theme", value);
  } catch (error) {
    console.log(error);
  }
}
export function getThemeC() {
  if (isServer) return undefined;
  let theme;
  try {
    theme = localStorage.getItem("theme") || undefined;
  } catch (error) {
    console.log(error);
  }
  return theme;
}
