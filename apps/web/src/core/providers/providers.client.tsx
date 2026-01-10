'use client'

import type { AuthGetSessionResponseSchema } from '@workspace/core/apis/better-auth'
import dynamic from 'next/dynamic'
import * as React from 'react'
import { Loader } from '@/core/components/ui'
import { AppAriaProvider } from '@/core/providers/aria/provider.client'
import { Devtools } from '@/core/providers/devtools.client'
import { AppQueryProvider } from '@/core/providers/query/provider.client'
import { AppToastProvider } from '@/core/providers/toast/provider.client'
import { WebVitals } from '@/core/providers/web-vitals.client'

// to make sure it rendered lazily in the browser
const FlagsProvider = dynamic(() => import('@/core/providers/flags/provider.client').then(module => ({ default: module.FlagsProvider })), { ssr: false })
// const LazyFlagsProvider = React.lazy(() => import('@/core/providers/flags/provider.client').then(module => ({ default: module.FlagsProvider })))

export function AppProviders({ children, locale, user }: { children: React.ReactNode, locale: string, user: NonNullable<AuthGetSessionResponseSchema>['user'] | null }) {
  return (
    <>
      <AppAriaProvider locale={locale}>
        <AppToastProvider>
          <AppQueryProvider>
            <FlagsProvider user={user}>
              <React.Suspense fallback={<Loader className="size-4.5" variant="spin" />}>
                {children}

                <Devtools />
              </React.Suspense>
            </FlagsProvider>
          </AppQueryProvider>
        </AppToastProvider>
      </AppAriaProvider>

      <WebVitals />
    </>
  )
}
