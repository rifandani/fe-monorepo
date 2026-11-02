import type { LocaleDictLanguage } from "@workspace/core/libs/i18n/init";
import { Match } from "effect";

const fallbackLocale: LocaleDictLanguage = "en-us";

/**
 * Maps a device language tag to a catalog Locale by primary subtag.
 * `en-GB` / `en-ID` → `en-us`; `id-ID` → `id-id`; unknown → `en-us`.
 */
export const resolveDeviceLocale = (
  languageTag?: string
): LocaleDictLanguage => {
  const [primaryTag] = languageTag?.toLowerCase().split("-") ?? [];

  return Match.value(primaryTag).pipe(
    Match.when("id", (): LocaleDictLanguage => "id-id"),
    Match.when("en", (): LocaleDictLanguage => "en-us"),
    Match.orElse(() => fallbackLocale)
  );
};
