'use client' // Error boundaries must be Client Components

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { Button } from '@/core/components/ui'
import { loggerBrowser } from '@/core/utils/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations()
  useEffect(() => {
    // Log the error to an error monitoring service (e.g. Sentry)
    loggerBrowser.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md space-y-8 text-center">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-8xl font-bold text-primary">4xx</h1>
          <h2 className="text-2xl font-semibold">Oops!</h2>
          <p className="text-muted-foreground">
            {t('core.somethingWentWrong')}
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
