import type { Formats, Locale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

import type { I18NLocale } from "@/core/constants/i18n";
import {
  I18N_COOKIE_NAME,
  I18N_DEFAULT_LOCALE,
  I18N_LOCALES,
} from "@/core/constants/i18n";
import "server-only";

export const formats = {
  dateTime: {
    short: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  },
  list: {
    enumeration: {
      style: "long",
      type: "conjunction",
    },
  },
  number: {
    precise: {
      maximumFractionDigits: 5,
    },
  },
} satisfies Formats;

const isSupportedLocale = (value?: string): value is I18NLocale =>
  I18N_LOCALES.some((supported) => supported === value);

export default getRequestConfig(async () => {
  const cookie = await cookies();
  const cookieLocale = cookie.get(I18N_COOKIE_NAME)?.value;
  // The cookie is client-controlled and feeds a dynamic import path below, so
  // only a value from the supported list is ever honored.
  const locale: Locale = isSupportedLocale(cookieLocale)
    ? cookieLocale
    : I18N_DEFAULT_LOCALE;
  const messages = await import(`../../../messages/${locale}.json`);

  return {
    locale,
    messages: messages.default,
  };
});
