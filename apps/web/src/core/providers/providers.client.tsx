'use client'

import { AppToastProvider } from '@/core/providers/toast/provider.client'
import * as React from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria'

export function AppProviders({ children, locale }: { children: React.ReactNode, locale: string }) {
  return (
    <AriaI18nProvider locale={locale}>
      <AppToastProvider>
        {children}
      </AppToastProvider>
    </AriaI18nProvider>
  )
}
