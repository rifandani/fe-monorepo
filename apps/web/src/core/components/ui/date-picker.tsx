'use client'

import type { DateDuration } from '@internationalized/date'
import { IconCalendarDays } from '@intentui/icons'
import { useMediaQuery } from '@workspace/core/hooks/use-media-query'
import {
  DatePicker as DatePickerPrimitive,
  type DatePickerProps as DatePickerPrimitiveProps,
  type DateValue,
  type PopoverProps,
  type ValidationResult,
} from 'react-aria-components'
import { twJoin } from 'tailwind-merge'
import { Button } from '@/core/components/ui/button'
import { Calendar } from '@/core/components/ui/calendar'
import { DateInput } from '@/core/components/ui/date-field'
import { Description, FieldError, FieldGroup, type FieldProps, Label } from '@/core/components/ui/field'
import { Modal } from '@/core/components/ui/modal'
import { PopoverContent } from '@/core/components/ui/popover'
import { composeTailwindRenderProps } from '@/core/components/ui/primitive'
import { RangeCalendar } from '@/core/components/ui/range-calendar'

interface DatePickerOverlayProps extends Omit<PopoverProps, 'children'> {
  range?: boolean
  visibleDuration?: DateDuration
  pageBehavior?: 'visible' | 'single'
}

function DatePickerOverlay({
  visibleDuration = { months: 1 },
  pageBehavior = 'visible',
  range,
  ...props
}: DatePickerOverlayProps) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  return isMobile
    ? (
        <Modal.Content aria-label="Date picker" closeButton={false}>
          <div className="flex justify-center p-6">
            {range
              ? (
                  <RangeCalendar pageBehavior={pageBehavior} visibleDuration={visibleDuration} />
                )
              : (
                  <Calendar />
                )}
          </div>
        </Modal.Content>
      )
    : (
        <PopoverContent
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
        </PopoverContent>
      )
}

function DatePickerIcon() {
  return (
    <Button
      size="sq-sm"
      intent="plain"
      className={`
        mr-1 h-7 w-8 rounded outline-hidden outline-offset-0
        hover:bg-transparent
        focus-visible:text-fg focus-visible:ring-0
        **:data-[slot=icon]:text-muted-fg
        group-open:*:data-[slot=icon]:text-fg
        pressed:bg-transparent
      `}
    >
      <IconCalendarDays
        aria-hidden
        className={`
          ml-2
          group-open:text-fg
        `}
      />
    </Button>
  )
}

interface DatePickerProps<T extends DateValue>
  extends DatePickerPrimitiveProps<T>,
  Pick<DatePickerOverlayProps, 'placement'>,
  Omit<FieldProps, 'placeholder'> {}

function DatePicker<T extends DateValue>({
  label,
  className,
  description,
  errorMessage,
  placement,
  ...props
}: DatePickerProps<T>) {
  return (
    <DatePickerPrimitive
      {...props}
      className={composeTailwindRenderProps(
        className,
        'group flex flex-col gap-y-1 *:data-[slot=label]:font-medium',
      )}
    >
      {label && <Label>{label}</Label>}
      <FieldGroup className="min-w-40">
        <DateInput className="w-full" />
        <DatePickerIcon />
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <DatePickerOverlay placement={placement} />
    </DatePickerPrimitive>
  )
}
export type { DatePickerProps, DateValue, ValidationResult }
export { DatePicker, DatePickerIcon, DatePickerOverlay }
