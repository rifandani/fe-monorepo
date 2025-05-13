import type { PropsWithChildren } from 'react'
import { useLocales } from 'expo-localization'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState } from 'react-native'
import { fallbackLocale, initI18n, pickSupportedLocale } from '@/core/providers/i18n/client'

function AppStateLanguageListener({ children }: PropsWithChildren) {
  const locale = useLocale()
  const { i18n } = useTranslation()
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    // Detect when user changing system language by listening to AppState and change the locale based on it
    // eslint-disable-next-line react-web-api/no-leaked-event-listener
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // App has come to the foreground and locale is supported
      if (appState.current.match(/inactive|background/) && nextAppState === 'active' && locale) {
        i18n.changeLanguage(locale?.languageCode ?? fallbackLocale)
      }

      appState.current = nextAppState
    })

    return () => {
      // unsubscribe from the change event listener
      subscription.remove()
    }
  }, [locale, i18n])

  return children
}

/**
 * Get the supported locale from the device locale
 *
 * @returns supported locale or fallback locale if no supported locale is found
 */
export function useLocale() {
  const locales = useLocales()
  const locale = useMemo(
    () => pickSupportedLocale(locales),
    [locales],
  )

  return locale
}

export function AppI18nProvider({ children }: PropsWithChildren) {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  // init locales for the first time
  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
  }, [])

  // do not load app, if locale not yet loaded
  if (!isI18nInitialized)
    return null

  return (
    <AppStateLanguageListener>{children}</AppStateLanguageListener>
  )
}
