import { Icon } from '@iconify/react'
import { tv, type VariantProps } from 'tailwind-variants'
import { match } from 'ts-pattern'

const noteStyles = tv({
  base: [
    'inset-ring-1 inset-ring-current/10 w-full overflow-hidden rounded-lg p-4 sm:text-sm/6',
    '[&_a]:underline data-hovered:[&_a]:underline **:[strong]:font-semibold',
  ],
  variants: {
    intent: {
      default: [
        'border-border bg-secondary/50 text-secondary-fg **:data-[slot=icon]:text-secondary-fg [&_a]:text-secondary-fg',
        'dark:**:data-[slot=icon]:text-secondary-fg dark:[&_a]:text-secondary-fg',
      ],
      info: [
        'bg-sky-500/5 text-sky-700 group-data-hovered:bg-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300 dark:group-data-hovered:bg-sky-500/20',
      ],
      warning:
        'bg-amber-400/20 text-amber-700 group-data-hovered:bg-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400 dark:group-data-hovered:bg-amber-400/15',
      danger:
        'bg-red-500/15 text-red-700 group-data-hovered:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:group-data-hovered:bg-red-500/20',
      success: [
        'border-success/20 bg-success/50 text-emerald-900 leading-4 **:data-[slot=icon]:text-success [&_a]:text-emerald-600',
        'dark:bg-success/10 dark:text-emerald-200 dark:**:data-[slot=icon]:text-emerald-400 dark:[&_a]:text-emerald-50',
      ],
    },
  },
  defaultVariants: {
    intent: 'default',
  },
})

interface NoteProps
  extends React.HtmlHTMLAttributes<HTMLDivElement>,
  VariantProps<typeof noteStyles> {
  indicator?: boolean
}

function Note({ indicator = true, intent = 'default', className, ...props }: NoteProps) {
  return (
    <div className={noteStyles({ intent, className })} {...props}>
      <div className="flex grow items-start">
        {intent !== 'default' && indicator && (
          <div className="shrink-0">
            {match(intent)
              .with('info', () => <Icon icon="ion:information-circle-outline" className="ring-current/30 mr-3 size-5 rounded-full leading-loose ring-4" />)
              .with('warning', () => <Icon icon="ion:alert-circle-outline" className="ring-current/30 mr-3 size-5 rounded-full leading-loose ring-4" />)
              .with('danger', () => <Icon icon="ion:alert-circle-outline" className="ring-current/30 mr-3 size-5 rounded-full leading-loose ring-4" />)
              .with('success', () => <Icon icon="ion:checkmark-circle-outline" className="ring-current/30 mr-3 size-5 rounded-full leading-loose ring-4" />)
              .exhaustive()}
          </div>
        )}
        <div className="text-pretty">{props.children}</div>
      </div>
    </div>
  )
}

export type { NoteProps }
export { Note }
