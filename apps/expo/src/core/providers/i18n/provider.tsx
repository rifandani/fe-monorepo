import type { LocaleDictLanguage } from "@workspace/core/libs/i18n/init";
import enUS from "@workspace/core/libs/i18n/locales/en-US";
import idID from "@workspace/core/libs/i18n/locales/id-ID";
import { getLocales } from "expo-localization";
import type { PropsWithChildren } from "react";

import { TranslationProvider } from "@/core/providers/i18n/context";
import { resolveDeviceLocale } from "@/core/utils/i18n";

const fallbackLocale: LocaleDictLanguage = "en-us";

const getDefaultLocale = (): LocaleDictLanguage => {
  const deviceTag = getLocales()[0]?.languageTag;
  return resolveDeviceLocale(deviceTag);
};

export const AppI18nProvider = ({ children }: PropsWithChildren) => (
  <TranslationProvider
    defaultLocale={getDefaultLocale()}
    fallbackLocale={[fallbackLocale]}
    translations={{
      "en-us": enUS,
      "id-id": idID,
    }}
  >
    {children}
  </TranslationProvider>
);

declare module "@workspace/core/libs/i18n/my-translations" {
  interface Register {
    translations: typeof enUS;
  }
}
