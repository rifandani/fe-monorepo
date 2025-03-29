import { loggerBrowser } from '@workspace/core/utils/logger'
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals'

/**
 * Report web vitals to the console. Enabled on production for now. Use per page basis.
 */
export function reportWebVitals() {
  // we could send to analytics here if the rating is not "good"
  onLCP((metric) => {
    loggerBrowser.info(metric, '[web-vitals]: LCP')
  })
  onINP((metric) => {
    loggerBrowser.info(metric, '[web-vitals]: INP')
  })
  onCLS((metric) => {
    loggerBrowser.info(metric, '[web-vitals]: CLS')
  })
  onFCP((metric) => {
    loggerBrowser.info(metric, '[web-vitals]: FCP')
  })
  onTTFB((metric) => {
    loggerBrowser.info(metric, '[web-vitals]: TTFB')
  })
}
