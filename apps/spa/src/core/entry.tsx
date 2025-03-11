import { AppI18nProvider } from '@/core/providers/i18n/provider'
import { AppQueryProvider } from '@/core/providers/query/provider'
import { ReloadPromptSw } from '@/core/providers/reload-prompt-sw'
import { AppRouterProvider } from '@/core/providers/router/provider'
import { AppToastProvider } from '@/core/providers/toast/provider'
import React from 'react'

export function Entry() {
  return (
    <React.StrictMode>
      <AppQueryProvider>
        <AppI18nProvider>
          <AppToastProvider>
            {/* Router entry point */}
            <AppRouterProvider />

            {/* PWA */}
            <ReloadPromptSw />
          </AppToastProvider>
        </AppI18nProvider>
      </AppQueryProvider>
    </React.StrictMode>
  )
}
