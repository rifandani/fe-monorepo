import type { LanguageMessages } from "@workspace/core/i18n/init";
import enUS from "@workspace/core/i18n/locales/en-US";
import idID from "@workspace/core/i18n/locales/id-ID";
import { Schema } from "effect";

export const locales = ["en-us", "id-id"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en-us";

export const localeSchema = Schema.Literals(locales);

export const localeNames: Readonly<Record<Locale, string>> = {
  "en-us": "English",
  "id-id": "Indonesia",
};

export const catalogs: Readonly<Record<Locale, LanguageMessages>> = {
  "en-us": enUS,
  "id-id": idID,
};

export const toLocale = (languageTag?: string): Locale => {
  const [primaryTag] = languageTag?.toLowerCase().split("-") ?? [];

  return (
    locales.find((locale) => locale.split("-")[0] === primaryTag) ??
    defaultLocale
  );
};
