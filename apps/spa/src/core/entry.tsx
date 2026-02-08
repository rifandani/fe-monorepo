import { Loader } from '@/core/components/ui'
import { TRACER_REACT_ENTRY } from '@/core/constants/global'
import { FlagsProvider } from '@/core/providers/flags/provider'
import { AppHeadProvider } from '@/core/providers/head/provider'
import { AppI18nProvider, AppTranslationProvider } from '@/core/providers/i18n/provider'
import { AppQueryProvider } from '@/core/providers/query/provider'
import { ReloadPromptSw } from '@/core/providers/reload-prompt-sw'
import { AppRouterProvider } from '@/core/providers/router/provider'
import { AppToastProvider } from '@/core/providers/toast/provider'
import * as React from 'react'
import { Suspense } from 'react'

export function Entry() {
  return (
    <React.StrictMode>
      <AppHeadProvider>
        <AppQueryProvider>
          <AppTranslationProvider>
            <AppI18nProvider>
              <AppToastProvider>
                <FlagsProvider>
                  <Suspense name={TRACER_REACT_ENTRY} fallback={<Loader className="size-4.5" variant="spin" />}>
                    {/* Router entry point */}
                    <AppRouterProvider />

                    {/* PWA */}
                    <ReloadPromptSw />
                  </Suspense>
                </FlagsProvider>
              </AppToastProvider>
            </AppI18nProvider>
          </AppTranslationProvider>
        </AppQueryProvider>
      </AppHeadProvider>
    </React.StrictMode>
  )
}
