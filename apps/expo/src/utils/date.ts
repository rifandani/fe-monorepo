import type { LocaleDictLanguage } from "@workspace/core/i18n/init";
import { format, isValid, parseISO } from "date-fns";
import { enUS, id } from "date-fns/locale";
import { Match } from "effect";

const resolveDateFnsLocale = (locale: string) =>
  Match.value(locale).pipe(
    Match.when("id-id", () => id),
    Match.orElse(() => enUS)
  );

/**
 * Formats an ISO / Date-parseable string for display (e.g. user `birthDate`).
 * Falls back to the raw string when parsing fails.
 */
export const formatDisplayDate = (
  value: string,
  locale: string = "en-us" satisfies LocaleDictLanguage
): string => {
  const parsed = parseISO(value);
  const date = isValid(parsed) ? parsed : new Date(value);

  if (!isValid(date)) {
    return value;
  }

  return format(date, "PPP", { locale: resolveDateFnsLocale(locale) });
};
