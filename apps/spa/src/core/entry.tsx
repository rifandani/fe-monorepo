import { useColorMode, usePreferredDark } from "@reactuses/core";
import { StrictMode, Suspense } from "react";

import { Loader } from "@/core/components/ui/loader";
import {
  COLOR_MODE_STORAGE_KEY,
  COLOR_MODES,
  TRACER_REACT_ENTRY,
} from "@/core/constants/global";
import { AppHeadProvider } from "@/core/providers/head/provider";
import {
  AppI18nProvider,
  AppTranslationProvider,
} from "@/core/providers/i18n/provider";
import { AppQueryProvider } from "@/core/providers/query/provider";
import { ReloadPromptSw } from "@/core/providers/reload-prompt-sw";
import { AppRouterProvider } from "@/core/providers/router/provider";
import { AppToastProvider } from "@/core/providers/toast/provider";

export const Entry = () => {
  const preferredDark = usePreferredDark();
  // Sole owner of the color-mode class on `<html>`. `Entry` never unmounts, so the
  // class is never torn down by `useColorMode`'s cleanup; everywhere else reads the
  // persisted mode straight from storage.
  useColorMode({
    defaultValue: "auto",
    modes: COLOR_MODES,
    // `auto` has no class of its own - it borrows whichever one the system prefers
    modeClassNames: {
      auto: preferredDark ? "dark" : "light",
      dark: "dark",
      light: "light",
    },
    storageKey: COLOR_MODE_STORAGE_KEY,
  });

  return (
    <StrictMode>
      <AppHeadProvider>
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
      </AppHeadProvider>
    </StrictMode>
  );
};
