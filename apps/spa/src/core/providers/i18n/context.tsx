import type { LanguageMessages } from '@workspace/core/libs/i18n/init'
import type { ReactNode } from 'react'
import { initI18n } from '@workspace/core/libs/i18n/init'
import {
  createContext,
  use,
  useMemo,
  useState,
} from 'react'

const TranslationContext = createContext<(ReturnType<typeof initI18n> & {
  setLocale: (locale: string) => void
  locale: string
  userLocale: string
}) | null
  >(null)

export function TranslationProvider({
  defaultLocale,
  translations,
  fallbackLocale,
  children,
}: {
  defaultLocale?: string
  translations: Record<Lowercase<string>, LanguageMessages>
  fallbackLocale: string | string[]
  children: ReactNode
}) {
  const [locale, setLocale] = useState(() => {
    if (!defaultLocale)
      return navigator.language.toLowerCase()
    return defaultLocale
  })

  const value = useMemo(() => {
    const initValue = initI18n({
      locale,
      fallbackLocale,
      translations,
    })

    return { ...initValue, setLocale, locale, userLocale: navigator.language.toLowerCase() } as const
  }, [locale, fallbackLocale, translations])

  return (
    <TranslationContext
      value={value}
    >
      {children}
    </TranslationContext>
  )
}

export function useTranslation(): ReturnType<typeof initI18n> & {
  setLocale: (locale: string) => void
  locale: string
  userLocale: string
} {
  const context = use(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}
