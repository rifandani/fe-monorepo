import { useColorMode } from '@workspace/core/hooks/use-color-mode'
import { useResetState } from '@workspace/core/hooks/use-reset-state'
import * as React from 'react'
import type { Toaster } from 'sonner'
import { twJoin } from 'tailwind-merge'

export type ToastContextInterface = ReturnType<typeof useCreateToastContext>
type ToasterProps = React.ComponentPropsWithoutRef<typeof Toaster>

// It's extracted into a function to be able to type the Context before it's even initialized.
export function useCreateToastContext() {
  const [theme] = useColorMode()
  const [toastConfig, setToastConfig, resetToastConfig] = useResetState<ToasterProps>({
    duration: 3_000,
    position: 'bottom-right',
    theme: theme === 'auto' ? 'system' : theme,
    className: 'toaster group',
    richColors: true,
    toastOptions: {
      className: twJoin(
        'not-has-data-[slot=note]:backdrop-blur-3xl will-change-transform *:data-[slot=note]:relative *:data-[slot=note]:z-50 *:data-icon:mt-0.5 *:data-icon:self-start has-data-description:*:data-icon:mt-1',
        '**:data-action:[--normal-bg:var(--color-primary-fg)] **:data-action:[--normal-text:var(--color-primary)]',
      ),
    },
    style: {
      '--normal-bg': 'var(--color-overlay)',
      '--normal-text': 'var(--color-overlay-fg)',
      '--normal-border': 'var(--color-border)',

      '--success-bg': 'var(--color-success-subtle)',
      '--success-border': 'color-mix(in oklab, var(--success-subtle-fg) 20%, transparent)',
      '--success-text': 'var(--color-success-subtle-fg)',

      '--error-bg': 'var(--color-danger-subtle)',
      '--error-border': 'color-mix(in oklab, var(--danger-subtle-fg) 20%, transparent)',
      '--error-text': 'var(--color-danger-subtle-fg)',

      '--warning-bg': 'var(--color-warning-subtle)',
      '--warning-border': 'color-mix(in oklab, var(--warning-subtle-fg) 20%, transparent)',
      '--warning-text': 'var(--color-warning-subtle-fg)',

      '--info-bg': 'var(--color-info-subtle)',
      '--info-border': 'color-mix(in oklab, var(--info-subtle-fg) 20%, transparent)',
      '--info-text': 'var(--color-info-subtle-fg)',
    } as React.CSSProperties,
  })

  const actions = {
    setToastConfig,
    resetToastConfig,
  }

  return [toastConfig, actions] as const
}

export const ToastContext = React.createContext<ToastContextInterface>(
  {} as ToastContextInterface,
)
