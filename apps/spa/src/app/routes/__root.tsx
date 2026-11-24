/* oxlint-disable typescript/ban-types -- `{} & string` keeps route autocompletion and still accepts any string */
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

const Devtools =
  import.meta.env.DEV && import.meta.env.VITE_E2E !== "true"
    ? lazy(async () => {
        const m = await import("@/app/providers/devtools");

        return { default: m.Devtools };
      })
    : null;

const RootRoute = () => {
  const router = useRouter();

  return (
    <>
      <RACRouterProvider
        navigate={(to, options) => {
          void router.navigate({
            ...options,
            href: to,
          });
        }}
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
