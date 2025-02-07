// if English isn't your default language, move Translations to the appropriate language file.
import type { Translations } from './locales/en'
import * as Localization from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { I18nManager } from 'react-native'
import en from './locales/en'
import id from './locales/id'
import 'intl-pluralrules'

export const fallbackLocale = 'en-US'
const systemLocales = Localization.getLocales()
const resources = { en, id }
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
  i18n.use(initReactI18next)

  await i18n.init({
    resources,
    lng: locale?.languageTag ?? fallbackLocale,
    fallbackLng: fallbackLocale,
    interpolation: {
      escapeValue: false,
    },
  })

  return i18n
}

/**
 * Builds up valid keypaths for translations.
 */
export type TxKeyPath = RecursiveKeyOf<Translations>

// via: https://stackoverflow.com/a/65333050
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, true>
}[keyof TObj & (string | number)]

type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<TObj[TKey], `${TKey}`, false>
}[keyof TObj & (string | number)]

type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
  IsFirstLevel extends boolean,
> = TValue extends any[]
  ? Text
  : TValue extends object
    ? IsFirstLevel extends true
      ? Text | `${Text}:${RecursiveKeyOfInner<TValue>}`
      : Text | `${Text}.${RecursiveKeyOfInner<TValue>}`
    : Text
