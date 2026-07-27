import type { LocaleDictLanguage } from "@workspace/core/libs/i18n/init";

const fallbackLocale: LocaleDictLanguage = "en-us";

/**
 * Maps a device language tag to a catalog Locale by primary subtag.
 * `en-GB` / `en-ID` → `en-us`; `id-ID` → `id-id`; unknown → `en-us`.
 */
export const resolveDeviceLocale = (
  languageTag?: string
): LocaleDictLanguage => {
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
};
