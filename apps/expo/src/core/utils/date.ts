import type { LocaleDictLanguage } from "@workspace/core/libs/i18n/init";
import { format, isValid, parseISO } from "date-fns";
import { enUS, id } from "date-fns/locale";
import { match } from "ts-pattern";

const resolveDateFnsLocale = (locale: LocaleDictLanguage | string) =>
  match(locale)
    .with("id-id", () => id)
    .otherwise(() => enUS);

/**
 * Formats an ISO / Date-parseable string for display (e.g. user `birthDate`).
 * Falls back to the raw string when parsing fails.
 */
export const formatDisplayDate = (
  value: string,
  locale: LocaleDictLanguage | string = "en-us"
): string => {
  const parsed = parseISO(value);
  const date = isValid(parsed) ? parsed : new Date(value);
  if (!isValid(date)) {
    return value;
  }
  return format(date, "PPP", { locale: resolveDateFnsLocale(locale) });
};
