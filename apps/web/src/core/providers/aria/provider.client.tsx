'use client'

import { useRouter } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { I18nProvider, RouterProvider } from 'react-aria-components'

// Configure the type of the `routerOptions` prop on all React Aria components.
declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>
  }
}

export function AppAriaProvider({ locale, children }: PropsWithChildren<{ locale: string }>) {
  const router = useRouter()

  return (
    <I18nProvider locale={locale}>
      <RouterProvider navigate={(path, routerOptions) => router.push(path as __next_route_internal_types__.RouteImpl<string>, routerOptions)}>
        {children}
      </RouterProvider>
    </I18nProvider>
  )
}
