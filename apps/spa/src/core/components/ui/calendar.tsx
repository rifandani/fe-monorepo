'use client'

import type { CalendarState } from '@react-stately/calendar'
import type { CalendarProps as CalendarPrimitiveProps, DateValue } from 'react-aria-components'
import { Icon } from '@iconify/react'
import { type CalendarDate, getLocalTimeZone, today } from '@internationalized/date'
import { useDateFormatter } from '@react-aria/i18n'
import { use } from 'react'
import {
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader as CalendarGridHeaderPrimitive,
  CalendarHeaderCell,
  Calendar as CalendarPrimitive,
  CalendarStateContext,
  composeRenderProps,
  Heading,
  Text,
  useLocale,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { Button } from '@/core/components/ui/button'
import { Select } from '@/core/components/ui/select'

interface CalendarProps<T extends DateValue>
  extends Omit<CalendarPrimitiveProps<T>, 'visibleDuration'> {
  errorMessage?: string
  className?: string
}

function Calendar<T extends DateValue>({ errorMessage, className, ...props }: CalendarProps<T>) {
  const now = today(getLocalTimeZone())

  return (
    <CalendarPrimitive {...props}>
      <CalendarHeader />
      <CalendarGrid>
        <CalendarGridHeader />
        <CalendarGridBody>
          {date => (
            <CalendarCell
              date={date}
              className={composeRenderProps(className, (className, { isSelected, isDisabled }) =>
                twMerge(
                  `
                    relative flex size-12 cursor-default items-center
                    justify-center rounded-lg text-fg tabular-nums
                    outline-hidden
                    hover:bg-secondary-fg/15
                    sm:size-9 sm:text-sm/6
                    forced-colors:text-[ButtonText] forced-colors:outline-0
                  `,
                  isSelected
                  && `
                    bg-primary text-primary-fg
                    hover:bg-primary/90
                    data-invalid:bg-danger data-invalid:text-danger-fg
                    forced-colors:bg-[Highlight] forced-colors:text-[Highlight]
                    forced-colors:data-invalid:bg-[Mark]
                    pressed:bg-primary
                  `,
                  isDisabled && `
                    text-muted-fg
                    forced-colors:text-[GrayText]
                  `,
                  date.compare(now) === 0
                  && `
                    after:pointer-events-none after:absolute after:start-1/2
                    after:bottom-1 after:z-10 after:size-[3px]
                    after:-translate-x-1/2 after:rounded-full after:bg-primary
                    focus-visible:after:bg-primary-fg
                    selected:after:bg-primary-fg
                  `,
                  className,
                ))}
            />
          )}
        </CalendarGridBody>
      </CalendarGrid>
      {errorMessage && (
        <Text slot="errorMessage" className="text-sm/6 text-danger">
          {errorMessage}
        </Text>
      )}
    </CalendarPrimitive>
  )
}

function CalendarHeader({
  isRange,
  className,
  ...props
}: React.ComponentProps<'header'> & { isRange?: boolean }) {
  const { direction } = useLocale()
  const state = use(CalendarStateContext)!

  return (
    <header
      data-slot="calendar-header"
      className={twMerge(
        `
          flex w-full justify-between gap-1.5 pt-1 pr-1 pb-5 pl-1.5
          sm:pb-4
        `,
        className,
      )}
      {...props}
    >
      {!isRange && (
        <div className="flex items-center gap-1.5">
          <SelectMonth state={state} />
          <SelectYear state={state} />
        </div>
      )}
      <Heading
        className={twMerge(
          `
            mr-2 flex-1 text-left font-medium text-muted-fg
            sm:text-sm
          `,
          !isRange && 'sr-only',
          className,
        )}
      />
      <div className="flex items-center gap-1">
        <Button
          size="sq-sm"
          className={`
            size-8
            **:data-[slot=icon]:text-fg
            sm:size-7
          `}
          isCircle
          intent="plain"
          slot="previous"
        >
          {direction === 'rtl' ? <Icon icon="lucide:chevron-right" /> : <Icon icon="lucide:chevron-left" />}
        </Button>
        <Button
          size="sq-sm"
          className={`
            size-8
            **:data-[slot=icon]:text-fg
            sm:size-7
          `}
          isCircle
          intent="plain"
          slot="next"
        >
          {direction === 'rtl' ? <Icon icon="lucide:chevron-left" /> : <Icon icon="lucide:chevron-right" />}
        </Button>
      </div>
    </header>
  )
}

function SelectMonth({ state }: { state: CalendarState }) {
  const months = []

  const formatter = useDateFormatter({
    month: 'long',
    timeZone: state.timeZone,
  })

  const numMonths = state.focusedDate.calendar.getMonthsInYear(state.focusedDate)
  for (let i = 1; i <= numMonths; i++) {
    const date = state.focusedDate.set({ month: i })
    months.push(formatter.format(date.toDate(state.timeZone)))
  }
  return (
    <Select
      className="[popover-width:8rem]"
      aria-label="Select month"
      selectedKey={state.focusedDate.month.toString() ?? (new Date().getMonth() + 1).toString()}
      onSelectionChange={(value) => {
        state.setFocusedDate(state.focusedDate.set({ month: Number(value) }))
      }}
    >
      <Select.Trigger className={`
        w-22 text-sm/5
        **:data-[slot=select-value]:inline-block
        **:data-[slot=select-value]:truncate
        sm:px-2.5 sm:py-1.5 sm:*:text-sm/5
      `}
      />
      <Select.List className="min-w-0">
        {months.map((month, index) => (
          <Select.Option key={index} id={(index + 1).toString()} textValue={month}>
            <Select.Label>{month}</Select.Label>
          </Select.Option>
        ))}
      </Select.List>
    </Select>
  )
}

function SelectYear({ state }: { state: CalendarState }) {
  const years: { value: CalendarDate, formatted: string }[] = []
  const formatter = useDateFormatter({
    year: 'numeric',
    timeZone: state.timeZone,
  })

  for (let i = -20; i <= 20; i++) {
    const date = state.focusedDate.add({ years: i })
    years.push({
      value: date,
      formatted: formatter.format(date.toDate(state.timeZone)),
    })
  }
  return (
    <Select
      aria-label="Select year"
      selectedKey={20}
      onSelectionChange={(value) => {
        state.setFocusedDate(years[Number(value)]?.value as CalendarDate)
      }}
    >
      <Select.Trigger className={`
        text-sm/5
        sm:px-2.5 sm:py-1.5 sm:*:text-sm/5
      `}
      />
      <Select.List>
        {years.map((year, i) => (
          <Select.Option key={i} id={i} textValue={year.formatted}>
            <Select.Label>{year.formatted}</Select.Label>
          </Select.Option>
        ))}
      </Select.List>
    </Select>
  )
}

function CalendarGridHeader() {
  return (
    <CalendarGridHeaderPrimitive>
      {day => (
        <CalendarHeaderCell className={`
          pb-2 text-center text-sm/6 font-semibold text-muted-fg
          sm:px-0 sm:py-0.5
          lg:text-xs
        `}
        >
          {day}
        </CalendarHeaderCell>
      )}
    </CalendarGridHeaderPrimitive>
  )
}

export type { CalendarProps }
export { Calendar, CalendarGridHeader, CalendarHeader }
