import { TranslationProvider, useTranslation } from '@/core/providers/i18n/context'
import enUS from '@workspace/core/libs/i18n/locales/en-US'
import idID from '@workspace/core/libs/i18n/locales/id-ID'
import type { PropsWithChildren } from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria'

/**
 * this should be imported first before `AppI18nProvider`
 */
export function AppTranslationProvider({ children }: PropsWithChildren) {
  return (
    <TranslationProvider
      fallbackLocale={['en-us']}
      translations={{
        'id-id': idID,
        'en-us': enUS,
      }}
    >
      {children}
    </TranslationProvider>
  )
}

/**
 * this should be imported second after `AppTranslationProvider`, because it uses `useTranslation` contexts
 */
export function AppI18nProvider({ children }: PropsWithChildren) {
  const { locale } = useTranslation()

  return (
    <AriaI18nProvider locale={locale}>{children}</AriaI18nProvider>
  )
}

declare module '@workspace/core/libs/i18n/my-translations' {
  interface Register {
    translations: typeof enUS
  }
}
