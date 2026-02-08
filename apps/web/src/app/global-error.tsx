'use client'

import { TRACER_GLOBAL_ERROR, TRACER_GLOBAL_ERROR_ON_ERROR } from '@/core/constants/global'
import { recordException } from '@/core/utils/telemetry'
import { trace } from '@opentelemetry/api'
import { logger } from '@workspace/core/utils/logger'
import NextError from 'next/error'
import { useEffect } from 'react'

const tracer = trace.getTracer(TRACER_GLOBAL_ERROR)

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    recordException({
      tracer,
      name: TRACER_GLOBAL_ERROR_ON_ERROR,
      error: {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      },
    })
    logger.error('[GlobalError]: Error', { error })
  }, [error])

  return (
    <html lang="en">
      <head>
        <meta name="msapplication-TileColor" content="#ffffff" />
        <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png" sizes="180x180" />
        <title>Global Error</title>
      </head>

      <body>
        {/* \`NextError\` is the default Next.js error page component. Its type
        definition requires a \`statusCode\` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  )
}
