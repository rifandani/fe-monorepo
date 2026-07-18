/* oxlint-disable eslint/func-style react-doctor/only-export-components */
import type { LocaleDictLanguage } from "@workspace/core/libs/i18n/init";
import enUS from "@workspace/core/libs/i18n/locales/en-US";
import idID from "@workspace/core/libs/i18n/locales/id-ID";
import { getLocales } from "expo-localization";
import type { PropsWithChildren } from "react";

import { TranslationProvider } from "@/core/providers/i18n/context";

const fallbackLocale: LocaleDictLanguage = "en-us";

/**
 * Maps a device language tag to a catalog Locale by primary subtag.
 * `en-GB` / `en-ID` → `en-us`; `id-ID` → `id-id`; unknown → `en-us`.
 */
export function resolveDeviceLocale(languageTag?: string): LocaleDictLanguage {
  if (!languageTag) {
    return fallbackLocale;
  }
  const [primaryTag] = languageTag.toLowerCase().split("-");
  if (primaryTag === "id") {
    return "id-id";
  }
  if (primaryTag === "en") {
    return "en-us";
  }
  return fallbackLocale;
}

function getDefaultLocale(): LocaleDictLanguage {
  const deviceTag = getLocales()[0]?.languageTag;
  return resolveDeviceLocale(deviceTag);
}

export function AppI18nProvider({ children }: PropsWithChildren) {
  return (
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
}

declare module "@workspace/core/libs/i18n/my-translations" {
  interface Register {
    translations: typeof enUS;
  }
}
