import type { LocaleDict } from '@workspace/core/locales/locale.type'
import { enLocale } from '@workspace/core/locales/en.locale'
import { idLocale } from '@workspace/core/locales/id.locale'

const localeDict: LocaleDict = {
  'en-US': enLocale,
  'id-ID': idLocale,
} as const

export { enLocale, idLocale, localeDict }
