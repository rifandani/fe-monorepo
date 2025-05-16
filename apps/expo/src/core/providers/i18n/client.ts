// if English isn't your default language, move Translations to the appropriate language file.
import * as Localization from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { I18nManager } from 'react-native'
import en from './locales/en.json'
import id from './locales/id.json'
import 'intl-pluralrules'

// also used for type inference in i18next.d.ts
export const resources = {
  en: {
    translation: en,
  },
  id: {
    translation: id,
  },
} as const
export const fallbackLocale = 'en-US'
const systemLocales = Localization.getLocales()
const supportedTags = Object.keys(resources)

/**
 * Checks if the device locale matches any of the supported locales
 * Device locale may be more specific and still match (e.g., en-US matches en)
 *
 * @param deviceTag - device locale
 * @returns true if the device locale matches any of the supported locales
 */
function systemTagMatchesSupportedTags(deviceTag: string) {
  const primaryTag = deviceTag.split('-')[0]
  return supportedTags.includes(primaryTag)
}

/**
 * Picks the supported locale from the device locale
 *
 * @returns supported locale or undefined if no supported locale is found
 */
export function pickSupportedLocale(locales: Localization.Locale[]) {
  return locales.find(locale => systemTagMatchesSupportedTags(locale.languageTag))
}

const locale = pickSupportedLocale(systemLocales)

/**
 * Sets the RTL direction for the app
 *
 * @returns true if the device locale is RTL
 */
export const isRTL = (() => {
  // Need to set RTL ASAP to ensure the app is rendered correctly. Waiting for i18n to init is too late.
  if (locale?.languageTag && locale?.textDirection === 'rtl') {
    I18nManager.allowRTL(true)
    return true
  }
  else {
    I18nManager.allowRTL(false)
    return false
  }
})()

/**
 * Initializes the i18n instance
 *
 * @returns i18n instance
 */
export async function initI18n() {
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: locale?.languageTag ?? fallbackLocale,
      fallbackLng: fallbackLocale,
      returnEmptyString: false,
      returnNull: false,
      interpolation: {
        escapeValue: false,
      },
    })

  return i18n
}

/**
 * Type utility that transforms a nested object into dot notation paths
 */
type DotPrefix<T extends string, K extends string> = `${T}${'' extends T ? '' : '.'}${K}`

/**
 * Recursive type that creates a union of all possible leaf paths in an object
 * Only includes paths to primitive values, not intermediate object keys
 */
type DotNestedKeys<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? DotPrefix<K, DotNestedKeys<T[K]>> : `${K}`;
    }[keyof T & string]
  : ''

/**
 * Type representing all possible translation keys in dot notation
 * E.g., 'common.errorModalTitle' | 'common.errorModalClose' | etc.
 * Only includes keys that lead to string values, not object nodes
 */
export type Translation = DotNestedKeys<typeof en>
