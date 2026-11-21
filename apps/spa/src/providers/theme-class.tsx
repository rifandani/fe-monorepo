import { useAtomValue } from "@effect/atom-react";
import { usePreferredDark } from "@reactuses/core";
import { useLayoutEffect } from "react";

import { persistence } from "@/lib/layers/persistence";

export const ThemeClass = () => {
  const theme = useAtomValue(persistence.themeAtom);
  const preferredDark = usePreferredDark();
  const preferred = preferredDark ? "dark" : "light";
  const mode = theme === "system" ? preferred : theme;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
  }, [mode]);

  return null;
};
