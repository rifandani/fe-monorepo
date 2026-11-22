import { useAtom } from "@effect/atom-react";
import { initI18n } from "@workspace/core/i18n/init";
import type { I18n } from "@workspace/core/i18n/init";
import { catalogs, defaultLocale } from "@workspace/core/i18n/locale";
import type { Locale } from "@workspace/core/i18n/locale";
import type { ReactNode } from "react";
import { createContext, use } from "react";

import { persistence } from "@/lib/layers/persistence";

type TranslationContextValue = I18n & {
  setLocale: (locale: Locale) => void;
  locale: Locale;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useAtom(persistence.localeAtom);

  const initValue = initI18n({
    fallbackLocale: defaultLocale,
    locale,
    translations: catalogs,
  });

  const value = { ...initValue, locale, setLocale } as const;

  return <TranslationContext value={value}>{children}</TranslationContext>;
};

export const useTranslation = (): TranslationContextValue => {
  const context = use(TranslationContext);

  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }

  return context;
};
