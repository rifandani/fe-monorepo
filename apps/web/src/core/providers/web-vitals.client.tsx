'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { loggerBrowser } from '@/core/utils/logger'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // we could send to analytics here if the rating is not "good"
    loggerBrowser.info(metric, `[web-vitals]: ${metric.name}`)
  })

  return null
}
