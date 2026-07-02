import { useLocales } from "expo-localization";
import type { PropsWithChildren } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppState } from "react-native";

import {
  fallbackLocale,
  initI18n,
  pickSupportedLocale,
} from "@/core/providers/i18n/client";

export const useLocale = () => {
  const locales = useLocales();
  const locale = useMemo(() => pickSupportedLocale(locales), [locales]);
  return locale;
};

const AppStateLanguageListener = ({ children }: PropsWithChildren) => {
  const locale = useLocale();
  const { i18n } = useTranslation();
  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        ["inactive", "background"].includes(appStateRef.current) &&
        nextAppState === "active" &&
        locale
      ) {
        i18n.changeLanguage(locale?.languageCode ?? fallbackLocale);
      }
      appStateRef.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, [locale, i18n]);
  return children;
};

export const AppI18nProvider = ({ children }: PropsWithChildren) => {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  useEffect(() => {
    void (async () => {
      await initI18n();
      setIsI18nInitialized(true);
    })();
  }, []);
  if (!isI18nInitialized) {
    return null;
  }
  return <AppStateLanguageListener>{children}</AppStateLanguageListener>;
};
