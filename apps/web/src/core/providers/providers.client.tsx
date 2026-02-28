'use client'

import { Loader } from '@/core/components/ui'
import { AppAriaProvider } from '@/core/providers/aria/provider.client'
import { Devtools } from '@/core/providers/devtools.client'
import { AppQueryProvider } from '@/core/providers/query/provider.client'
import { AppToastProvider } from '@/core/providers/toast/provider.client'
import { WebVitals } from '@/core/providers/web-vitals.client'
import * as React from 'react'

export function AppProviders({ children, locale }: { children: React.ReactNode, locale: string }) {
  return (
    <>
      <AppAriaProvider locale={locale}>
        <AppToastProvider>
          <AppQueryProvider>
            <React.Suspense fallback={<Loader className="size-4.5" variant="spin" />}>
              {children}

              <Devtools />
            </React.Suspense>
          </AppQueryProvider>
        </AppToastProvider>
      </AppAriaProvider>

      <WebVitals />
    </>
  )
}
