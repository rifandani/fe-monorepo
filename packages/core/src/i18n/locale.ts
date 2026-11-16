import type { LanguageMessages } from "@workspace/core/i18n/init";
import enUS from "@workspace/core/i18n/locales/en-US";
import idID from "@workspace/core/i18n/locales/id-ID";
import { Schema } from "effect";

/**
 * @description The supported Locales, in the order a picker shows them. This is
 * the one list: the type, the schema, the names and the catalogs below all
 * follow it, so a new Locale is a compile error until each one has an entry.
 */
export const locales = ["en-us", "id-id"] as const;

export type Locale = (typeof locales)[number];

/** @description The Locale used when no supported Locale can be found. */
export const defaultLocale: Locale = "en-us";

/** @description Decodes a value only if it is a supported Locale. */
export const localeSchema = Schema.Literals(locales);

/** @description The name of each Locale, written in its own language. */
export const localeNames: Readonly<Record<Locale, string>> = {
  "en-us": "English",
  "id-id": "Indonesia",
};

/** @description The Message Catalog of each Locale. */
export const catalogs: Readonly<Record<Locale, LanguageMessages>> = {
  "en-us": enUS,
  "id-id": idID,
};

/**
 * @description Map any BCP-47 language tag (`navigator.language`, the device
 * language tag) to a supported Locale, by its primary language subtag.
 * `en-GB` → `en-us`, `id` → `id-id`. A missing or unknown tag gives
 * `defaultLocale`.
 */
export const toLocale = (languageTag?: string): Locale => {
  const [primaryTag] = languageTag?.toLowerCase().split("-") ?? [];

  return (
    locales.find((locale) => locale.split("-")[0] === primaryTag) ??
    defaultLocale
  );
};
