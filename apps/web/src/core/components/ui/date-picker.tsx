'use client'

import type { DateDuration } from '@internationalized/date'
import type { DatePickerProps as DatePickerPrimitiveProps, DateValue, DialogProps, PopoverProps, ValidationResult } from 'react-aria-components'
import { Icon } from '@iconify/react'
import {
  DatePicker as DatePickerPrimitive,
} from 'react-aria-components'
import { twJoin } from 'tailwind-merge'
import { Button } from './button'
import { Calendar } from './calendar'
import { DateInput } from './date-field'
import { Description, FieldError, FieldGroup, Label } from './field'
import { Popover } from './popover'
import { composeTailwindRenderProps } from './primitive'
import { RangeCalendar } from './range-calendar'

interface DatePickerOverlayProps
  extends Omit<DialogProps, 'children' | 'className' | 'style'>,
  Omit<PopoverProps, 'children' | 'className' | 'style'> {
  className?: string | ((values: { defaultClassName?: string }) => string)
  children?: React.ReactNode
  closeButton?: boolean
  range?: boolean
  visibleDuration?: DateDuration
  pageBehavior?: 'visible' | 'single'
}

function DatePickerOverlay({
  visibleDuration = { months: 1 },
  closeButton = true,
  pageBehavior = 'visible',
  range,
  ...props
}: DatePickerOverlayProps) {
  return (
    <Popover.Content
      isDismissable={false}
      showArrow={false}
      className={twJoin(
        `
          flex max-w-none min-w-auto snap-x justify-center p-4
          sm:min-w-[16.5rem] sm:p-2 sm:pt-3
        `,
        visibleDuration?.months === 1 ? 'sm:max-w-2xs' : 'sm:max-w-none',
      )}
      {...props}
    >
      {range
        ? (
            <RangeCalendar pageBehavior={pageBehavior} visibleDuration={visibleDuration} />
          )
        : (
            <Calendar />
          )}
      {closeButton && (
        <div className={`
          mx-auto flex w-full max-w-[inherit] justify-center py-2.5
          sm:hidden
        `}
        >
          <Popover.Close shape="circle" className="w-full">
            Close
          </Popover.Close>
        </div>
      )}
    </Popover.Content>
  )
}

function DatePickerIcon() {
  return (
    <Button
      size="square-petite"
      intent="plain"
      className={`
        mr-1 h-7 w-8 rounded
        outline-offset-0hover:bg-transparent
        **:data-[slot=icon]:text-muted-fg
        pressed:bg-transparent
      `}
    >
      <Icon
        icon="mdi:calendar-outline"
        aria-hidden
        className={`
          ml-2
          group-open:text-fg
        `}
      />
    </Button>
  )
}

interface DatePickerProps<T extends DateValue> extends DatePickerPrimitiveProps<T> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
}

function DatePicker<T extends DateValue>({
  label,
  className,
  description,
  errorMessage,
  ...props
}: DatePickerProps<T>) {
  return (
    <DatePickerPrimitive
      {...props}
      className={composeTailwindRenderProps(className, 'group/date-picker flex flex-col gap-y-1')}
    >
      {label && <Label>{label}</Label>}
      <FieldGroup className="min-w-40">
        <DateInput className={`
          w-full px-2 text-base
          sm:text-sm
        `}
        />
        <DatePickerIcon />
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <DatePickerOverlay />
    </DatePickerPrimitive>
  )
}
export type { DatePickerProps, DateValue, ValidationResult }
export { DatePicker, DatePickerIcon, DatePickerOverlay }
