import { fallbackLocale, initI18n, pickSupportedLocale } from '@/core/providers/i18n/client'
import { useLocales } from 'expo-localization'
import type { PropsWithChildren } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AppState } from 'react-native'

function AppStateLanguageListener({ children }: PropsWithChildren) {
  const locale = useLocale()
  const { i18n } = useTranslation()
  const appStateRef = useRef(AppState.currentState)

  useEffect(() => {
    // Detect when user changing system language by listening to AppState and change the locale based on it

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // App has come to the foreground and locale is supported
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active' && locale) {
        i18n.changeLanguage(locale?.languageCode ?? fallbackLocale)
      }

      appStateRef.current = nextAppState
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
 *
 * @note
 * "en-US" means preferred language is English and region is United States
 * "id-ID" means preferred language is Indonesian and region is Indonesia
 * "en-ID" means preferred language is English and region is Indonesia
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
