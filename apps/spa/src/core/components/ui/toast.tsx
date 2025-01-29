'use client'

import type { ToasterProps } from 'sonner'
import {
  Icon,
} from '@iconify/react'
import { useColorMode } from '@workspace/core/hooks/use-color-mode.hook'
import { Toaster as ToasterPrimitive } from 'sonner'
import { twMerge } from 'tailwind-merge'

import { buttonStyles } from './button'
import { Loader } from './loader'

function Toast({ ...props }: ToasterProps) {
  const [theme] = useColorMode()

  return (
    <ToasterPrimitive
      theme={theme === 'auto' ? 'system' : theme}
      className="toaster group"
      richColors
      icons={{
        info: <Icon icon="lucide:info" />,
        error: <Icon icon="lucide:triangle-alert" />,
        warning: <Icon icon="lucide:circle-alert" />,
        success: <Icon icon="lucide:circle-check" />,
        loading: <Loader variant="spin" />,
      }}
      toastOptions={{
        unstyled: true,
        closeButton: true,
        classNames: {
          toast: twMerge(
            'not-has-data-description:**:data-title:font-normal! text-[0.925rem]',
            'has-data-description:**:data-title:font-medium [&:has([data-description])_[data-title]]:text-base!',
            'has-data-[slot=icon]:**:data-content:pl-0',
            'has-data-button:*:data-content:mb-10',
            'has-data-button:**:data-close-button:hidden! flex w-full rounded-xl p-4',
            'inset-ring-1 inset-ring-current/10 backdrop-blur-3xl',
          ),
          icon: 'absolute top-[0.2rem] [--toast-icon-margin-end:7px] *:data-[slot=icon]:text-fg *:data-[slot=icon]:size-4.5 **:data-[slot=icon]:text-current',
          title: '',
          description: '',
          default: 'bg-bg text-fg [--gray2:theme(--color-fg/10%)]',
          content: 'pr-6 *:data-description:text-current/65! *:data-description:text-sm!',
          error:
            'inset-ring-danger/15 dark:inset-ring-danger/25 [--error-bg:theme(--color-danger/10%)] [--error-border:transparent] [--error-text:var(--color-danger)]',
          info: 'inset-ring-sky-600/15 dark:inset-ring-sky-500/20 [--info-border:transparent] [--info-bg:theme(--color-sky-500/10%)] [--info-text:var(--color-sky-700)] dark:[--info-bg:theme(--color-sky-500/15%)] dark:[--info-text:var(--color-sky-400)]',
          warning:
            'inset-ring-warning/30 dark:inset-ring-warning/15 [--warning-bg:theme(--color-warning/20%)] dark:[--warning-bg:theme(--color-warning/10%)] [--warning-border:transparent] [--warning-text:var(--color-warning-fg)] dark:[--warning-text:var(--color-warning)]',
          success:
            'inset-ring-success/20 [--success-bg:theme(--color-success/80%)] dark:[--success-bg:theme(--color-success/20%)] [--success-border:transparent] [--success-text:#fff] dark:[--success-text:var(--color-success)]',
          cancelButton: buttonStyles({
            className:
              'hover:border-secondary-fg/10 hover:bg-secondary/90 self-start absolute bottom-4 left-4 justify-self-start',
            size: 'extra-small',
            appearance: 'outline',
          }),
          actionButton: buttonStyles({
            className: 'absolute bottom-4 right-4 self-end justify-self-end',
            size: 'extra-small',
          }),
          closeButton:
            '*:[svg]:size-12 size-6! rounded-md! [--gray1:transparent] [--gray4:transparent] [--gray5:transparent] [--gray12:current] [--toast-close-button-start:full] [--toast-close-button-end:-6px] [--toast-close-button-transform:translate(-75%,60%)] absolute',
        },
      }}
      {...props}
    />
  )
}

export type { ToasterProps }
export { Toast }
