import type { ErrorComponentProps } from '@tanstack/react-router'
import { Icon } from '@iconify/react'
import { trace } from '@opentelemetry/api'
import { createRouter } from '@tanstack/react-router'
import { useColorMode } from '@workspace/core/hooks/use-color-mode'
import { logger } from '@workspace/core/utils/logger'
import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store'
import { Button } from '@/core/components/ui'
import { Link } from '@/core/components/ui/link'
import { TRACER_ROUTER, TRACER_ROUTER_ON_ERROR } from '@/core/constants/global'
import { useTranslation } from '@/core/providers/i18n/context'
import { queryClient } from '@/core/providers/query/client'
import { recordException } from '@/core/utils/telemetry'
import { routeTree } from '../../../routeTree.gen'

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const tracer = trace.getTracer(TRACER_ROUTER)

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultOnCatch: (error, errorInfo) => {
    recordException({
      tracer,
      name: TRACER_ROUTER_ON_ERROR,
      error: {
        name: error instanceof Error ? error.name : undefined,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        ...errorInfo,
      },
    })
  },
  defaultNotFoundComponent: NotFoundRoute,
  defaultPendingComponent: PendingRoute,
  defaultErrorComponent: ErrorRoute,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  // Since we're using React Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
})

function PendingRoute() {
  return (
    <div className="flex items-center justify-center">
      <Icon
        icon="svg-spinners:3-dots-fade"
        height="5em"
        className="text-primary"
      />
    </div>
  )
}

function ErrorRoute({ reset, error, info }: ErrorComponentProps) {
  logger.error('[ErrorRoute]: Error', { error, info })

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-primary">4xx</h1>
          <h2 className="text-2xl font-semibold">Oops!</h2>
          <p className="text-muted-fg">
            Something went wrong
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
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
          <p className="text-muted-fg">
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
