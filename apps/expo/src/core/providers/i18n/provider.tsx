import type { LocaleDictLanguage } from "@workspace/core/i18n/init";
import enUS from "@workspace/core/i18n/locales/en-US";
import idID from "@workspace/core/i18n/locales/id-ID";
import type { PropsWithChildren } from "react";

import { TranslationProvider } from "@/core/providers/i18n/context";

const fallbackLocale: LocaleDictLanguage = "en-us";

export const AppI18nProvider = ({ children }: PropsWithChildren) => (
  <TranslationProvider
    fallbackLocale={[fallbackLocale]}
    translations={{
      "en-us": enUS,
      "id-id": idID,
    }}
  >
    {children}
  </TranslationProvider>
);

declare module "@workspace/core/i18n/my-translations" {
  interface Register {
    translations: typeof enUS;
  }
}
