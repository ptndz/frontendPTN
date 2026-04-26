import { useEffect } from "react";
import { setCookie } from "cookies-next";
import { getThemeC, setThemeC } from "../plugins/theme";

type UseThemeBootstrapParams = {
  theme: string;
  setTheme: (theme: string) => void;
};

export const useThemeBootstrap = ({ theme, setTheme }: UseThemeBootstrapParams) => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const themeC = getThemeC();
    const root = document.documentElement;

    if (theme && themeC) {
      root.classList.remove("dark", "light");
      root.classList.add(theme);
      setThemeC(theme);
      setCookie("theme", theme);
      return;
    }

    if (themeC && theme === "") {
      root.classList.remove("dark", "light");
      root.classList.add(themeC);
      setTheme(themeC);
      setCookie("theme", themeC);
      return;
    }

    setTheme("light");
    setThemeC("light");
    setCookie("theme", "light");
    root.classList.add("light");
  }, [setTheme, theme]);
};
