import { useAtomValue } from "@effect/atom-react";
import { usePreferredDark } from "@reactuses/core";
import { PersistenceProvider } from "@workspace/core/persistence/provider";
import { StrictMode, Suspense, useLayoutEffect } from "react";

import { Loader } from "@/core/components/ui/loader";
import { TRACER_REACT_ENTRY } from "@/core/constants/global";
import { persistence } from "@/core/layers/persistence";
import { AppHeadProvider } from "@/core/providers/head/provider";
import {
  AppI18nProvider,
  AppTranslationProvider,
} from "@/core/providers/i18n/provider";
import { AppQueryProvider } from "@/core/providers/query/provider";
import { ReloadPromptSw } from "@/core/providers/reload-prompt-sw";
import { AppRouterProvider } from "@/core/providers/router/provider";
import { AppToastProvider } from "@/core/providers/toast/provider";

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
