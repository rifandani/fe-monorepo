/* oxlint-disable import/no-cycle typescript/ban-types */
import type { QueryClient } from "@tanstack/react-query";
import type {
  NavigateOptions,
  RegisteredRouter,
  ToPathOption,
} from "@tanstack/react-router";
import {
  createRootRouteWithContext,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { RouterProvider as RACRouterProvider } from "react-aria-components";

declare module "react-aria-components" {
  interface RouterConfig {
    href: ToPathOption<RegisteredRouter, "/", "/"> | ({} & string);
    routerOptions: Omit<NavigateOptions, "to" | "from">;
  }
}

const Devtools = import.meta.env.DEV
  ? lazy(async () => {
      const m = await import("@/core/providers/devtools");
      return { default: m.Devtools };
    })
  : null;

const RootRoute = () => {
  const router = useRouter();
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
            // SAFETY: react-aria hands back an href built from this app's own
            // links; TanStack cannot verify that through the generic `navigate` hook.
            to: to as ToPathOption<RegisteredRouter, "/", "/">,
          })
        }
        useHref={(to) => router.buildLocation({ to }).href}
      >
        <Outlet />
      </RACRouterProvider>

      {Devtools ? (
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
      ) : null}
    </>
  );
};
export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootRoute,
});
