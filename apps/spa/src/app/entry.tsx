import { useAtomValue } from "@effect/atom-react";
import { usePreferredDark } from "@reactuses/core";
import { PersistenceProvider } from "@workspace/core/persistence/provider";
import { StrictMode, Suspense, useLayoutEffect } from "react";

import { AppRouterProvider } from "@/app/providers/router/provider";
import { Loader } from "@/components/ui/loader";
import { persistence } from "@/lib/layers/persistence";
import { AppHeadProvider } from "@/providers/head/provider";
import {
  AppI18nProvider,
  AppTranslationProvider,
} from "@/providers/i18n/provider";
import { AppQueryProvider } from "@/providers/query/provider";
import { ReloadPromptSw } from "@/providers/reload-prompt-sw";
import { AppToastProvider } from "@/providers/toast/provider";
import { TRACER_REACT_ENTRY } from "@/shared/constants/global";

/**
 * Sole owner of the color-mode class on `<html>`. Everywhere else reads the
 * picked theme from `themeAtom`. `system` has no class of its own: it borrows
 * whichever one the system prefers.
 */
const ThemeClass = () => {
  const theme = useAtomValue(persistence.themeAtom);
  const preferredDark = usePreferredDark();
  const preferred = preferredDark ? "dark" : "light";
  const mode = theme === "system" ? preferred : theme;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(mode);
  }, [mode]);

  return null;
};

export const Entry = () => (
  <StrictMode>
    <AppHeadProvider>
      <PersistenceProvider persistence={persistence}>
        <ThemeClass />
        <AppQueryProvider>
          <AppTranslationProvider>
            <AppI18nProvider>
              <AppToastProvider>
                <Suspense
                  name={TRACER_REACT_ENTRY}
                  fallback={<Loader className="size-4.5" variant="spin" />}
                >
                  {/* Router entry point */}
                  <AppRouterProvider />

                  {/* PWA */}
                  <ReloadPromptSw />
                </Suspense>
              </AppToastProvider>
            </AppI18nProvider>
          </AppTranslationProvider>
        </AppQueryProvider>
      </PersistenceProvider>
    </AppHeadProvider>
  </StrictMode>
);
