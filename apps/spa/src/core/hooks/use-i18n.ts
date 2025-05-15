import type { Formatter } from '@workspace/core/locales/type'
import { localeDict } from '@workspace/core/locales'
import React from 'react'
import { useMessageFormatter } from 'react-aria'
import { I18nContext } from '@/core/providers/i18n/context'

export function useI18n() {
  const formatter: Formatter = useMessageFormatter(localeDict)
  const context = React.use(I18nContext)

  if (!context)
    throw new Error('useI18n: cannot find the I18nContext')

  const [, actions] = context

  // we don't include `context[0]`, because it's already covered using `useLocale`
  return React.useMemo(() => [formatter, actions] as const, [formatter, actions])
}
