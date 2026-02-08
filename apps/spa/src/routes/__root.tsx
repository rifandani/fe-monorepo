import { Devtools } from '@/core/providers/devtools'
import type { QueryClient } from '@tanstack/react-query'
import type { NavigateOptions, RegisteredRouter, ToPathOption } from '@tanstack/react-router'
import {
  createRootRouteWithContext,
  Outlet,
  useRouter,
} from '@tanstack/react-router'
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
