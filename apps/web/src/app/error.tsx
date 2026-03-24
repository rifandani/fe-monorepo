'use client' // Error boundaries must be Client Components

import { trace } from '@opentelemetry/api'
import { logger } from '@workspace/core/utils/logger'
import { useEffect } from 'react'
import { Button } from '@/core/components/ui'
import { TRACER_ROOT_ROUTE, TRACER_ROOT_ROUTE_ON_ERROR } from '@/core/constants/global'
import { recordException } from '@/core/utils/telemetry'

const tracer = trace.getTracer(TRACER_ROOT_ROUTE)

/**
 * designed to catch errors during rendering (not inside event handlers) to show a fallback UI instead of crashing the whole app.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    recordException({
      tracer,
      name: TRACER_ROOT_ROUTE_ON_ERROR,
      error: {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      },
    })
    logger.error('[Error]: Error', { error })
  }, [error])

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
