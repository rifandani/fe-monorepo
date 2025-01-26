import type { PropsWithChildren } from 'react'
import { I18nProvider as AriaI18nProvider } from 'react-aria'
import { I18nContext, useI18nContext } from './context'

export function AppI18nProvider({ children }: PropsWithChildren) {
  const value = useI18nContext()

  return (
    // FIXME: Remove this once we upgrade to react 19
    // eslint-disable-next-line react/no-context-provider
    <I18nContext.Provider value={value}>
      <AriaI18nProvider locale={value[0]}>{children}</AriaI18nProvider>
    </I18nContext.Provider>
  )
}
