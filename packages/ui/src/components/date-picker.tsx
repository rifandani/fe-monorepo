'use client'

import { Icon } from '@iconify/react'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { Button } from '@workspace/ui/components/button'
import { Popover } from '@workspace/ui/components/popover'
import {
  DatePicker,
  DateRangePicker,
  type DateRangePickerProps,
  type DateValue,
  Dialog,
  type DialogProps,
  Group,
  type GroupProps,
  type PopoverProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const _DatePicker = DatePicker

const _DateRangePicker = DateRangePicker

export interface _DatePickerButtonProps extends GroupProps {
  date?: DateValue
}

function _DatePickerButton({ date, ...props }: _DatePickerButtonProps) {
  return (
    <Group {...props}>
      <Button
        variant="outline"
        className={twMerge(
          'w-[280px] justify-start text-left font-normal',
          !date && 'text-muted-foreground',
        )}
      >
        <Icon icon="lucide:calendar" className="mr-2 size-4" />

        {date
          ? (
              new DateFormatter(getLocalTimeZone(), { dateStyle: 'long' }).format(
                date.toDate(getLocalTimeZone()),
              )
            )
          : (
              <span>Pick a date</span>
            )}
      </Button>
    </Group>
  )
}

export interface _DateRangePickerButtonProps extends GroupProps {
  date?: DateRangePickerProps<DateValue>['value']
}

function _DateRangePickerButton({
  date,
  ...props
}: _DateRangePickerButtonProps) {
  return (
    <Group {...props}>
      <Button
        variant="outline"
        className={twMerge(
          'w-[280px] justify-start text-left font-normal',
          !date && 'text-muted-foreground',
        )}
      >
        <Icon icon="lucide:calendar" className="mr-2 size-4" />

        {date?.end
          ? (
              <>
                {`${new DateFormatter(getLocalTimeZone(), {
                  dateStyle: 'medium',
                }).format(
                  date.start.toDate(getLocalTimeZone()),
                )} - ${new DateFormatter(getLocalTimeZone(), {
                  dateStyle: 'medium',
                }).format(date.end.toDate(getLocalTimeZone()))}`}
              </>
            )
          : (
              <span>Pick a date</span>
            )}
      </Button>
    </Group>
  )
}

function _DatePickerContent({
  className,
  popoverClassName,
  ...props
}: DialogProps & { popoverClassName?: PopoverProps['className'] }) {
  return (
    <Popover
      className={values =>
        twMerge(
          'w-auto p-3',
          typeof popoverClassName === 'function'
            ? popoverClassName(values)
            : popoverClassName,
        )}
    >
      <Dialog
        className={twMerge(
          'flex w-full flex-col space-y-4 outline-none sm:flex-row sm:space-x-4 sm:space-y-0',
          className,
        )}
        {...props}
      />
    </Popover>
  )
}

export {
  _DatePicker as DatePicker,
  _DatePickerButton as DatePickerButton,
  _DatePickerContent as DatePickerContent,
  _DateRangePicker as DateRangePicker,
  _DateRangePickerButton as DateRangePickerButton,
}
