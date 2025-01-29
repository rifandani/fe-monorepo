import type { QueryClient } from '@tanstack/react-query'
import type { NavigateOptions, RegisteredRouter, ToPathOption } from '@tanstack/react-router'
import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store.hook'
import { Link } from '@/core/components/ui/link'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import {
  createRootRouteWithContext,

  Outlet,

  useRouter,
} from '@tanstack/react-router'
import { useColorMode } from '@workspace/core/hooks/use-color-mode.hook'
import { RouterProvider as RACRouterProvider } from 'react-aria-components'

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
  notFoundComponent: NotFoundRoute,
})

function RootRoute() {
  const router = useRouter()

  return (
    // RAC such as Link, Menu, Tabs, Table, and many others support rendering elements as links that perform navigation when the user interacts with them.
    // It needs to be wrapped by RAC RouterProvider component.
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
  )
}

function NotFoundRoute() {
  const userStore = useAuthUserStore()
  const [t] = useI18n()
  useColorMode()

  return (
    // bg-[0_0_,10px_10px]
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(hsl(var(--primary))_0.5px_,transparent_0.5px),radial-gradient(hsl(var(--primary))_0.5px_,hsl(var(--background))_0.5px)] bg-[length:20px_20px] font-mono opacity-80">
      <h1 className="text-primary text-8xl font-bold tracking-wider">404</h1>
      <h2 className="my-3 text-2xl font-semibold">{t('notFound')}</h2>
      <p className="">{t('gone')}</p>

      <Link
        href={userStore.user ? '/' : '/login'}
        className="mt-10 transition duration-300 hover:skew-x-12"
      >
        {t('backTo', { target: userStore.user ? 'home' : 'login' })}
      </Link>
    </div>
  )
}
