import type en from './messages/en.json'
import type { formats } from './src/core/utils/i18n'

const locales = ['en', 'id'] as const
type Messages = typeof en
type Formats = typeof formats
type Locale = (typeof locales)[number]

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale
    Messages: Messages
    Formats: Formats
  }
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
    readonly NEXT_PUBLIC_APP_TITLE: string
    readonly NEXT_PUBLIC_APP_URL: string
    readonly NEXT_PUBLIC_API_BASE_URL: string
    readonly NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID: string
    readonly NEXT_PUBLIC_FLAGSMITH_API_URL: string
  }
}
