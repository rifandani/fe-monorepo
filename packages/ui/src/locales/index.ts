import type { LocaleDict } from '@workspace/ui/locales/locale.type'
import { enLocale } from '@workspace/ui/locales/en.locale'
import { idLocale } from '@workspace/ui/locales/id.locale'

const localeDict: LocaleDict = {
  'en-US': enLocale,
  'id-ID': idLocale,
} as const

export { enLocale, idLocale, localeDict }
