import { ToastContext } from '@/core/providers/toast/context'
import React from 'react'

export function useToaster() {
  const context = React.use(ToastContext)
  if (!context)
    throw new Error('useToaster: cannot find the ToastContext')

  return context
}
