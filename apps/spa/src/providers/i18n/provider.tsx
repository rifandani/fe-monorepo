import type { PropsWithChildren } from "react";
import { I18nProvider as AriaI18nProvider } from "react-aria";

import { useTranslation } from "@/providers/i18n/context";

export const AppI18nProvider = ({ children }: PropsWithChildren) => {
  const { locale } = useTranslation();

  return <AriaI18nProvider locale={locale}>{children}</AriaI18nProvider>;
};
