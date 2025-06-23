import type { QueryClient } from '@tanstack/react-query'
import type { ErrorComponentProps, NavigateOptions, RegisteredRouter, ToPathOption } from '@tanstack/react-router'
import {
  createRootRouteWithContext,
  Outlet,
  useRouter,
} from '@tanstack/react-router'
import { useColorMode } from '@workspace/core/hooks/use-color-mode'
import { logger } from '@workspace/core/utils/logger'
import { useEffect } from 'react'
import { RouterProvider as RACRouterProvider } from 'react-aria-components'
import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store'
import { Button } from '@/core/components/ui'
import { Link } from '@/core/components/ui/link'
import { Devtools } from '@/core/providers/devtools'
import { useTranslation } from '@/core/providers/i18n/context'

declare module 'react-aria-components' {
  interface RouterConfig {
    href: ToPathOption<RegisteredRouter, '/', '/'> | ({} & string)
    routerOptions: Omit<NavigateOptions, 'to' | 'from'>
  }
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootRoute,
  errorComponent: ErrorRoute,
  notFoundComponent: NotFoundRoute,
})

function RootRoute() {
  const router = useRouter()

  return (
    <>
      {/*
        * RAC such as Link, Menu, Tabs, Table, and many others support rendering elements as links that perform navigation when the user interacts with them.
        * It needs to be wrapped by RAC RouterProvider component.
        */}
      <RACRouterProvider
        navigate={(to, options) =>
          router.navigate({
            ...options,
            to: to as ToPathOption<RegisteredRouter, '/', '/'>,
          })}
        useHref={to => router.buildLocation({ to }).href}
      >
        <Outlet />
      </RACRouterProvider>

      <Devtools />
    </>
  )
}

function ErrorRoute({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    // Log the error to an error monitoring service (e.g. Sentry)
    logger.error('[ErrorRoute]: Error', { error })
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-primary">4xx</h1>
          <h2 className="text-2xl font-semibold">Oops!</h2>
          <p className="text-muted-foreground">
            Something went wrong
          </p>
        </div>

        {/* Quick Actions */}
        <div className={`
          flex flex-col justify-center gap-4
          sm:flex-row
        `}
        >
          <Button
            intent="primary"
            className="flex items-center"
            onClick={
            // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}

function NotFoundRoute() {
  useColorMode()
  const userStore = useAuthUserStore()
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">{t('notFound')}</h2>
          <p className="text-muted-foreground">
            {t('gone')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className={`
          flex flex-col justify-center gap-4
          sm:flex-row
        `}
        >
          <Link
            intent="primary"
            href={userStore.user ? '/' : '/login'}
            className="flex items-center"
          >
            {t('backTo', {
              target: userStore.user ? 'Home' : 'Login',
            })}
          </Link>
        </div>
      </div>
    </div>
  )
}
