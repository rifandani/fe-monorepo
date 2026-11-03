import { useAtom } from "@effect/atom-react";
import type { LanguageMessages } from "@workspace/core/i18n/init";
import { initI18n } from "@workspace/core/i18n/init";
import type { ReactNode } from "react";
import { createContext, use } from "react";

import { getDeviceLocale, persistence } from "@/core/layers/persistence";

type TranslationContextValue = ReturnType<typeof initI18n> & {
  setLocale: (locale: string) => void;
  locale: string;
  userLocale: string;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

/**
 * @description Holds the Locale and exposes `t` / `setLocale`. The Locale itself
 * is `localeAtom`, so a pick survives a restart; the Device Locale is only the
 * default while nothing is stored.
 */
export const TranslationProvider = ({
  translations,
  fallbackLocale,
  children,
}: {
  translations: Record<Lowercase<string>, LanguageMessages>;
  fallbackLocale: string | string[];
  children: ReactNode;
}) => {
  const [locale, setLocale] = useAtom(persistence.localeAtom);

  const initValue = initI18n({
    fallbackLocale,
    locale,
    translations,
  });

  const value = {
    ...initValue,
    locale,
    setLocale,
    userLocale: getDeviceLocale(),
  } as const;

  return <TranslationContext value={value}>{children}</TranslationContext>;
};

export const useTranslation = (): TranslationContextValue => {
  const context = use(TranslationContext);

  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return context;
};
