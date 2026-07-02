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
import { RouterProvider as RACRouterProvider } from "react-aria-components";

declare module "react-aria-components" {
  interface RouterConfig {
    href: ToPathOption<RegisteredRouter, "/", "/"> | string;
    routerOptions: Omit<NavigateOptions, "to" | "from">;
  }
}

const RootRoute = () => {
  const router = useRouter();
  return (
    <RACRouterProvider
      navigate={(to, options) =>
        router.navigate({
          ...options,
          to: to as ToPathOption<RegisteredRouter, "/", "/">,
        })
      }
      useHref={(to) => router.buildLocation({ to }).href}
    >
      <Outlet />
    </RACRouterProvider>
  );
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootRoute,
});
