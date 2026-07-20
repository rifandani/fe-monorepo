/* oxlint-disable react-doctor/server-auth-actions -- locale cookie helpers are intentionally public */
"use server";
import { cookies } from "next/headers";
import { z } from "zod";

import {
  I18N_COOKIE_NAME,
  I18N_DEFAULT_LOCALE,
  I18N_LOCALES,
} from "@/core/constants/i18n";

const localeSchema = z.enum(I18N_LOCALES);

/**
 * Retrieves the user's preferred locale from cookies
 * @returns {Promise<string>} The user's locale string, or the default I18N_DEFAULT_LOCALE if not set
 */
export const getUserLocaleAction = async () => {
  const cookie = await cookies();
  return cookie.get(I18N_COOKIE_NAME)?.value ?? I18N_DEFAULT_LOCALE;
};

/**
 * Sets the user's preferred locale in cookies
 * @returns An object containing an error message if the locale payload is invalid
 */
export const setUserLocaleAction = async (
  locale: z.infer<typeof localeSchema>
): Promise<{ error?: string } | undefined> => {
  const parsed = localeSchema.safeParse(locale);
  if (!parsed.success) {
    return { error: z.prettifyError(parsed.error) };
  }
  const cookie = await cookies();
  cookie.set(I18N_COOKIE_NAME, parsed.data);
};
