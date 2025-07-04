'use client'

import { Icon } from '@iconify/react'
import { twMerge } from 'tailwind-merge'
import { match } from 'ts-pattern'

interface NoteProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  intent?: 'default' | 'info' | 'warning' | 'danger' | 'success'
  indicator?: boolean
}

function Note({ indicator = true, intent = 'default', className, ...props }: NoteProps) {
  return (
    <div
      className={twMerge([
        `
          grid w-full grid-cols-[1fr_auto] gap-3 overflow-hidden rounded-lg p-4
          inset-ring-1 inset-ring-current/10
          sm:text-sm/6
        `,
        `
          [&_a]:underline
          hover:[&_a]:underline
          **:[strong]:font-semibold
        `,
        intent === 'default'
        && `
          border-border bg-secondary/20 text-secondary-fg
          **:data-[slot=icon]:text-secondary-fg
          dark:**:data-[slot=icon]:text-secondary-fg
          dark:[&_a]:text-secondary-fg
          [&_a]:text-secondary-fg
        `,
        intent === 'info'
        && `
          bg-sky-500/5 text-sky-700
          group-hover:bg-sky-500/25
          dark:bg-sky-500/10 dark:text-sky-300 dark:group-hover:bg-sky-500/20
        `,
        intent === 'warning'
        && `
          bg-amber-400/20 text-amber-700
          group-hover:bg-amber-400/30
          dark:bg-amber-400/10 dark:text-amber-400
          dark:group-hover:bg-amber-400/15
        `,
        intent === 'danger'
        && `
          bg-red-500/15 text-red-700
          group-hover:bg-red-500/25
          dark:bg-red-500/10 dark:text-red-400 dark:group-hover:bg-red-500/20
        `,
        intent === 'success'
        && `
          border-success/20 bg-success/10 leading-4 text-emerald-800
          **:data-[slot=icon]:text-success
          dark:bg-success/10 dark:text-emerald-200
          dark:**:data-[slot=icon]:text-emerald-400 dark:[&_a]:text-emerald-50
          [&_a]:text-emerald-600
        `,
      ])}
      {...props}
    >
      {indicator && match(intent)
        .with('info', () => (
          <Icon
            icon="mdi:alert-circle-outline"
            className="col-start-1 size-5 shrink-0"
          />
        ))
        .with('warning', () => (
          <Icon
            icon="mdi:alert-outline"
            className="col-start-1 size-5 shrink-0"
          />
        ))
        .with('danger', () => (
          <Icon
            icon="mdi:alert-outline"
            className="col-start-1 size-5 shrink-0"
          />
        ))
        .with('success', () => (
          <Icon
            icon="mdi:check-circle-outline"
            className="col-start-1 size-5 shrink-0"
          />
        ))
        .otherwise(() => null)}
      <div className={`
        text-base/6 text-pretty
        group-has-data-[slot=icon]:col-start-2
        sm:text-sm/6
      `}
      >
        {props.children}
      </div>
    </div>
  )
}

export type { NoteProps }
export { Note }
