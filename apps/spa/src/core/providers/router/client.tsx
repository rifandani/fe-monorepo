import { trace } from "@opentelemetry/api";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { createRouter } from "@tanstack/react-router";
import { useColorMode } from "@workspace/core/hooks/use-color-mode";
import { logger } from "@workspace/core/utils/logger";

import { useAuthUserStore } from "@/auth/hooks/use-auth-user-store";
import { Button } from "@/core/components/ui/button";
import { Link } from "@/core/components/ui/link";
import { TRACER_ROUTER, TRACER_ROUTER_ON_ERROR } from "@/core/constants/global";
import { useTranslation } from "@/core/providers/i18n/context";
import { queryClient } from "@/core/providers/query/client";
import { recordException } from "@/core/utils/telemetry";

import { routeTree } from "../../../routeTree.gen";
// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const tracer = trace.getTracer(TRACER_ROUTER);

const PendingRoute = () => (
  <div className="flex items-center justify-center">
    <svg viewBox="0 0 24 24" height="5em" className="text-primary">
      <use href="#svg-spinners--3-dots-fade" />
    </svg>
  </div>
);

const ErrorRoute = ({ reset, error, info }: ErrorComponentProps) => {
  logger.error("[ErrorRoute]: Error", { error, info });
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-primary">4xx</h1>
          <h2 className="text-2xl font-semibold">Oops!</h2>
          <p className="text-muted-fg">Something went wrong</p>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            intent="primary"
            className="flex items-center"
            onClick={() => reset()}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
};

const NotFoundRoute = () => {
  useColorMode();
  const userStore = useAuthUserStore();
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">{t("notFound")}</h2>
          <p className="text-muted-fg">{t("gone")}</p>
        </div>

        <div
          className={`
          flex flex-col justify-center gap-4
          sm:flex-row
        `}
        >
          <Link
            href={userStore.user ? "/" : "/login"}
            className="flex items-center"
          >
            {t("backTo", {
              target: userStore.user ? "Home" : "Login",
            })}
          </Link>
        </div>
      </div>
    </div>
  );
};

// Create a new router instance
export const router = createRouter({
  context: {
    queryClient,
  },
  defaultErrorComponent: ErrorRoute,
  defaultNotFoundComponent: NotFoundRoute,
  defaultOnCatch: (error, errorInfo) => {
    recordException({
      error: {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        ...errorInfo,
      },
      name: TRACER_ROUTER_ON_ERROR,
      tracer,
    });
  },
  defaultPendingComponent: PendingRoute,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  routeTree,
});
