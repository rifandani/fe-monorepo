import type { Toaster } from 'sonner'
import { useColorMode } from '@workspace/core/hooks/use-color-mode.hook'
import { useResetState } from '@workspace/core/hooks/use-reset-state.hook'
import React from 'react'
import { twMerge } from 'tailwind-merge'

export type ToastContextInterface = ReturnType<typeof useCreateToastContext>
type ToasterProps = React.ComponentPropsWithoutRef<typeof Toaster>

// It's extracted into a function to be able to type the Context before it's even initialized.
export function useCreateToastContext() {
  const [theme] = useColorMode()
  const [toastConfig, setToastConfig, resetToastConfig] = useResetState<ToasterProps>({
    duration: 3_000,
    position: 'bottom-right',
    cn: twMerge,
    theme: theme === 'auto' ? 'system' : theme,
    className: 'toaster group',
    toastOptions: {
      classNames: {
        toast:
          'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton:
          'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton:
          'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      },
    },
  })

  const actions = React.useMemo(
    () => ({
      setToastConfig,
      resetToastConfig,
    }),
    [setToastConfig, resetToastConfig],
  )

  return React.useMemo(() => [toastConfig, actions] as const, [toastConfig, actions])
}

export const ToastContext = React.createContext<ToastContextInterface>(
  {} as ToastContextInterface,
)
