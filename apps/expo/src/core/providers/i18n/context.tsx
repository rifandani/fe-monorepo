import type { LanguageMessages } from "@workspace/core/libs/i18n/init";
import { initI18n } from "@workspace/core/libs/i18n/init";
import type { ReactNode } from "react";
import { createContext, use, useState } from "react";

const TranslationContext = createContext<
  | (ReturnType<typeof initI18n> & {
      setLocale: (locale: string) => void;
      locale: string;
      userLocale: string;
    })
  | null
>(null);

export const TranslationProvider = ({
  defaultLocale,
  translations,
  fallbackLocale,
  children,
}: {
  defaultLocale?: string;
  translations: Record<Lowercase<string>, LanguageMessages>;
  fallbackLocale: string | string[];
  children: ReactNode;
}) => {
  const [locale, setLocale] = useState(() => {
    if (!defaultLocale) {
      return "en-us";
    }
    return defaultLocale;
  });
  const initValue = initI18n({
    fallbackLocale,
    locale,
    translations,
  });
  const value = {
    ...initValue,
    locale,
    setLocale,
    userLocale: defaultLocale ?? "en-us",
  } as const;
  return <TranslationContext value={value}>{children}</TranslationContext>;
};

export const useTranslation = (): ReturnType<typeof initI18n> & {
  setLocale: (locale: string) => void;
  locale: string;
  userLocale: string;
} => {
  const context = use(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};
