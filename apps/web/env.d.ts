import type en from './messages/en.json'
import type { formats } from './src/core/i18n/request'

type Messages = typeof en
type Formats = typeof formats

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages { }
  // Use type safe formats with `next-intl`
  interface IntlFormats extends Formats { }
}

declare global {
  interface Window {
    toggleRqDevtools: () => void
  }
}

declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     * Bundle environment variables for the browser by prefixing with NEXT_PUBLIC_
     */
    readonly NEXT_PUBLIC_TITLE: string
    readonly NEXT_PUBLIC_API_BASE_URL: string
  }
}
