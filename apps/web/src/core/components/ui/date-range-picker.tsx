'use client'

import type { DateDuration } from '@internationalized/date'
import type { Placement } from '@react-types/overlays'
import type { DateRangePickerProps as DateRangePickerPrimitiveProps, DateValue, ValidationResult } from 'react-aria-components'
import {
  DateRangePicker as DateRangePickerPrimitive,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { DateInput } from './date-field'
import { DatePickerIcon, DatePickerOverlay } from './date-picker'
import { Description, FieldError, FieldGroup, Label } from './field'
import { composeTailwindRenderProps } from './primitive'

const dateRangePickerStyles = tv({
  slots: {
    base: 'group flex flex-col gap-y-1.5',
    dateRangePickerInputStart: 'px-2 text-base tabular-nums sm:text-sm',
    dateRangePickerInputEnd: 'flex-1 px-2 py-1.5 text-base tabular-nums sm:text-sm',
    dateRangePickerDash:
      'text-fg group-data-disabled:text-muted-fg forced-colors:text-[ButtonText] forced-colors:group-data-disabled:text-[GrayText]',
  },
})
const { base, dateRangePickerInputStart, dateRangePickerInputEnd, dateRangePickerDash }
  = dateRangePickerStyles()

interface DateRangePickerProps<T extends DateValue> extends DateRangePickerPrimitiveProps<T> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
  visibleDuration?: DateDuration
  pageBehavior?: 'visible' | 'single'
  contentPlacement?: Placement
}

function DateRangePicker<T extends DateValue>({
  label,
  className,
  description,
  errorMessage,
  contentPlacement = 'bottom',
  visibleDuration,
  ...props
}: DateRangePickerProps<T>) {
  return (
    <DateRangePickerPrimitive {...props} className={composeTailwindRenderProps(className, base())}>
      {label && <Label>{label}</Label>}
      <FieldGroup className="w-auto min-w-40">
        <DateInput slot="start" className={dateRangePickerInputStart()} />
        <span aria-hidden="true" className={dateRangePickerDash()}>
          –
        </span>
        <DateInput slot="end" className={dateRangePickerInputEnd()} />
        <DatePickerIcon />
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <DatePickerOverlay
        placement={contentPlacement}
        visibleDuration={visibleDuration ?? { months: 1 }}
        range
      />
    </DateRangePickerPrimitive>
  )
}
export type { DateRangePickerProps }
export { DateRangePicker }
