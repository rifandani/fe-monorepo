import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'
import { ToastContext, useCreateToastContext } from './context'

export function AppToastProvider({ children }: PropsWithChildren) {
  const value = useCreateToastContext()

  return (
    // FIXME: Remove this once we upgrade to react 19
    // eslint-disable-next-line react/no-context-provider
    <ToastContext.Provider value={value}>
      {children}
      <Toaster {...value[0]} />
    </ToastContext.Provider>
  )
}
