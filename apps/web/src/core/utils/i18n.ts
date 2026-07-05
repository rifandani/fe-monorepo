import type { Formats, Locale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

import { I18N_COOKIE_NAME, I18N_DEFAULT_LOCALE } from "@/core/constants/i18n";
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
export default getRequestConfig(async () => {
  const cookie = await cookies();
  const locale = (cookie.get(I18N_COOKIE_NAME)?.value ||
    I18N_DEFAULT_LOCALE) as Locale;
  const messages = await import(`../../../messages/${locale}.json`);

  return {
    locale,
    messages: messages.default,
  };
});
