'use client'

import type { PropsWithChildren } from 'react'
import { useRouter } from 'next/navigation'
import { I18nProvider, RouterProvider } from 'react-aria-components'

// Configure the type of the `routerOptions` prop on all React Aria components.
declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>
  }
}

export function AppAriaProvider({ locale, children}: PropsWithChildren<{ locale: string }>) {
  const router = useRouter()

  return (
    <I18nProvider locale={locale}>
      <RouterProvider navigate={router.push}>
        {children}
      </RouterProvider>
    </I18nProvider>
  )
}
