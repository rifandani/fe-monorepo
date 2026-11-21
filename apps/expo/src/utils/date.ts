import { defaultLocale } from "@workspace/core/i18n/locale";
import type { Locale } from "@workspace/core/i18n/locale";
import { format, isValid, parseISO } from "date-fns";
import { enUS, id } from "date-fns/locale";
import type { Locale as DateFnsLocale } from "date-fns/locale";

const dateFnsLocales: Record<Locale, DateFnsLocale> = {
  "en-us": enUS,
  "id-id": id,
};

export const formatDisplayDate = (
  value: string,
  locale: Locale = defaultLocale
): string => {
  const parsed = parseISO(value);
  const date = isValid(parsed) ? parsed : new Date(value);

  if (!isValid(date)) {
    return value;
  }

  return format(date, "PPP", { locale: dateFnsLocales[locale] });
};
