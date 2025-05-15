import React from 'react'
import { ToastContext } from '@/core/providers/toast/context'

/**
 * Hooks to get access to the ToastContext which is used for sonner props
 */
export function useToaster() {
  const context = React.use(ToastContext)
  if (!context)
    throw new Error('useToaster: cannot find the ToastContext')

  return context
}
