import { ToastContext, useCreateToastContext } from './context'
import type { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'

export function AppToastProvider({ children }: PropsWithChildren) {
  const value = useCreateToastContext()

  return (
    <ToastContext value={value}>
      {children}
      <Toaster {...value[0]} />
    </ToastContext>
  )
}
