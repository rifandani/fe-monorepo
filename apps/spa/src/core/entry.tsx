import React from 'react'
import { AppHeadProvider } from '@/core/providers/head/provider'
import { AppI18nProvider, AppTranslationProvider } from '@/core/providers/i18n/provider'
import { AppQueryProvider } from '@/core/providers/query/provider'
import { ReloadPromptSw } from '@/core/providers/reload-prompt-sw'
import { AppRouterProvider } from '@/core/providers/router/provider'
import { AppToastProvider } from '@/core/providers/toast/provider'

export function Entry() {
  return (
    <React.StrictMode>
      <AppHeadProvider>
        <AppQueryProvider>
          <AppTranslationProvider>
            <AppI18nProvider>
              <AppToastProvider>
                {/* Router entry point */}
                <AppRouterProvider />

                {/* PWA */}
                <ReloadPromptSw />
              </AppToastProvider>
            </AppI18nProvider>
          </AppTranslationProvider>
        </AppQueryProvider>
      </AppHeadProvider>
    </React.StrictMode>
  )
}
