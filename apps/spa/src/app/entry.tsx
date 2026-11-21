import { PersistenceProvider } from "@workspace/core/persistence/provider";
import { StrictMode, Suspense } from "react";

import { AppRouterProvider } from "@/app/providers/router/provider";
import { Loader } from "@/components/ui/loader";
import { persistence } from "@/lib/layers/persistence";
import { AppHeadProvider } from "@/providers/head/provider";
import { TranslationProvider } from "@/providers/i18n/context";
import { AppI18nProvider } from "@/providers/i18n/provider";
import { AppQueryProvider } from "@/providers/query/provider";
import { ReloadPromptSw } from "@/providers/reload-prompt-sw";
import { ThemeClass } from "@/providers/theme-class";
import { AppToastProvider } from "@/providers/toast/provider";
import { TRACER_REACT_ENTRY } from "@/shared/constants/global";

export const Entry = () => (
  <StrictMode>
    <AppHeadProvider>
      <PersistenceProvider persistence={persistence}>
        <ThemeClass />
        <AppQueryProvider>
          <TranslationProvider>
            <AppI18nProvider>
              <AppToastProvider>
                <Suspense
                  name={TRACER_REACT_ENTRY}
                  fallback={<Loader className="size-4.5" variant="spin" />}
                >
                  <AppRouterProvider />

                  <ReloadPromptSw />
                </Suspense>
              </AppToastProvider>
            </AppI18nProvider>
          </TranslationProvider>
        </AppQueryProvider>
      </PersistenceProvider>
    </AppHeadProvider>
  </StrictMode>
);
