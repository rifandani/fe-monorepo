'use client'

import { Icon } from '@iconify/react'
import { getLocalTimeZone, today } from '@internationalized/date'
import { buttonVariants } from '@workspace/ui/components/button'
import * as React from 'react'
import {
  Button,
  Calendar,
  CalendarCell,
  type CalendarCellProps,
  CalendarGrid,
  CalendarGridBody,
  type CalendarGridBodyProps,
  CalendarGridHeader,
  type CalendarGridHeaderProps,
  type CalendarGridProps,
  CalendarHeaderCell,
  type CalendarHeaderCellProps,
  Heading,
  RangeCalendar,
  RangeCalendarStateContext,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const _Calendar = Calendar

const _RangeCalendar = RangeCalendar

function _CalendarHeading({
  ...props
}: React.HTMLAttributes<HTMLHeadElement>) {
  return (
    <header className="relative flex items-center justify-center pt-1" {...props}>
      <Heading className="text-sm font-medium" />
      <div className="flex items-center">
        <Button
          slot="next"
          className={twMerge(
            buttonVariants({ variant: 'outline' }),
            'size-7 bg-transparent p-0 opacity-50 data-[hovered]:opacity-100',
            'text-popover-foreground absolute right-1',
          )}
        >
          <Icon icon="lucide:chevron-right" className="size-4" />
        </Button>
        <Button
          slot="previous"
          className={twMerge(
            buttonVariants({ variant: 'outline' }),
            'size-7 bg-transparent p-0 opacity-50 data-[hovered]:opacity-100',
            'text-popover-foreground absolute left-1',
          )}
        >
          <Icon icon="lucide:chevron-left" className="size-4" />
        </Button>
      </div>
    </header>
  )
}

function _CalendarGrid({ className, ...props }: CalendarGridProps) {
  return (
    <CalendarGrid
      className={twMerge('mt-4 w-full border-collapse space-y-1', className)}
      {...props}
    />
  )
}

function _CalendarGridHeader({
  className,
  ...props
}: CalendarGridHeaderProps) {
  return (
    <CalendarGridHeader
      className={twMerge('[&>tr]:flex', className)}
      {...props}
    />
  )
}

function _CalendarHeaderCell({
  className,
  ...props
}: CalendarHeaderCellProps) {
  return (
    <CalendarHeaderCell
      className={twMerge(
        'text-muted-foreground w-9 rounded-md text-[0.8rem] font-normal',
        className,
      )}
      {...props}
    />
  )
}

function _CalendarGridBody({ className, ...props }: CalendarGridBodyProps) {
  return (
    <CalendarGridBody
      className={twMerge(
        '[&>tr>td]:p-0 [&>tr]:mt-2 [&>tr]:flex [&>tr]:w-full',
        '[&>tr>td:first-child>div]:rounded-l-md [&>tr>td:last-child>div]:rounded-r-md',
        className,
      )}
      {...props}
    />
  )
}

function CalendarCellBase({ className, date, ...props }: CalendarCellProps) {
  const isRange = Boolean(React.useContext(RangeCalendarStateContext))
  return (
    <CalendarCell
      className={values =>
        twMerge(
          'ring-offset-background data-[hovered]:bg-accent data-[hovered]:text-accent-foreground inline-flex size-9 items-center justify-center  whitespace-nowrap rounded-md p-0 text-sm font-normal transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[selected]:opacity-100',
          date.compare(today(getLocalTimeZone())) === 0
          && 'bg-accent text-accent-foreground',
          values.isDisabled && 'text-muted-foreground opacity-50',
          values.isFocusVisible
          && values.isFocused
          && 'ring-ring outline-none ring-2 ring-offset-2',
          values.isSelected
          && isRange
          && 'bg-accent text-accent-foreground rounded-none',
          ((values.isSelected && !isRange)
            || values.isSelectionStart
            || values.isSelectionEnd)
          && 'bg-primary text-primary-foreground data-[focused]:bg-primary data-[hovered]:bg-primary data-[focused]:text-primary-foreground data-[hovered]:text-primary-foreground rounded-md',
          values.isOutsideMonth
          && 'text-muted-foreground data-[selected]:bg-accent/50 data-[selected]:text-muted-foreground opacity-50 data-[selected]:opacity-30',
          typeof className === 'function' ? className(values) : className,
        )}
      date={date}
      {...props}
    />
  )
}

export {
  _Calendar as Calendar,
  CalendarCellBase as CalendarCell,
  _CalendarGrid as CalendarGrid,
  _CalendarGridBody as CalendarGridBody,
  _CalendarGridHeader as CalendarGridHeader,
  _CalendarHeaderCell as CalendarHeaderCell,
  _CalendarHeading as CalendarHeading,
  _RangeCalendar as RangeCalendar,
}
