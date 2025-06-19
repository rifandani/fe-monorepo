'use client'

import type { AuthLoginResponseSchema } from '@workspace/core/apis/auth'
import * as React from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria'
import { Loader } from '@/core/components/ui'
import { AppQueryProvider } from '@/core/providers/query/provider.client'
import { AppToastProvider } from '@/core/providers/toast/provider.client'
import { WebVitals } from '@/core/providers/web-vitals.client'

// to make sure it only rendered in the browser
const LazyFlagsProvider = React.lazy(() => import('@/core/providers/flags/provider.client').then(module => ({ default: module.FlagsProvider })))

export function AppProviders({ children, locale, user }: { children: React.ReactNode, locale: string, user: AuthLoginResponseSchema | null }) {
  return (
    <>
      <AriaI18nProvider locale={locale}>
        <AppToastProvider>
          <AppQueryProvider>
            <LazyFlagsProvider user={user}>
              <React.Suspense fallback={<Loader className="size-4.5" variant="spin" />}>
                {children}
              </React.Suspense>
            </LazyFlagsProvider>
          </AppQueryProvider>
        </AppToastProvider>
      </AriaI18nProvider>

      <WebVitals />
    </>
  )
}
