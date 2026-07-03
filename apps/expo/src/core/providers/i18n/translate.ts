import type { TOptions } from 'i18next'
import type en from './locales/en.json'
import i18n from 'i18next'

/**
 * Builds up valid keypaths for translations.
 */
export type TxKeyPath = RecursiveKeyOf<typeof en>

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

/**
 * Translates text.
 * @deprecated use `useTranslation` from `react-i18next` instead
 * @param {TxKeyPath} key - The i18n key.
 * @param {TOptions} options - The i18n options.
 * @returns {string} - The translated text.
 * @example
 * Translations:
 *
 * ```en.ts
 * {
 *  "hello": "Hello, {{name}}!"
 * }
 * ```
 *
 * Usage:
 * ```ts
 * import { translate } from "./i18n"
 *
 * translate("common:ok", { name: "world" })
 * // => "Hello world!"
 * ```
 */
export function translate(key: TxKeyPath, options?: TOptions): string {
  if (i18n.isInitialized) {
    // @ts-expect-error unused anyway
    return i18n.t(key, options)
  }
  return key
}
