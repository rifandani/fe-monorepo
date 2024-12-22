'use client'

import type * as React from 'react'
import { Icon } from '@iconify/react'
import {
  Button,
  type ButtonProps,
  Collection,
  Header,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  type ListBoxProps,
  Popover,
  type PopoverProps,
  Section,
  Select,
  SelectValue,
  type SelectValueProps,
  Separator,
  type SeparatorProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const _Select = Select

const SelectSection = Section

const SelectCollection = Collection

function _SelectValue<T extends object>({
  className,
  ...props
}: SelectValueProps<T>) {
  return (
    <SelectValue
      className={values =>
        twMerge(
          'data-[placeholder]:text-muted-foreground',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

function SelectTrigger({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      className={values =>
        twMerge(
          'border-input bg-background ring-offset-background data-[focused]:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[focused]:outline-none data-[focused]:ring-2 data-[focused]:ring-offset-2',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    >
      {values => (
        <>
          {typeof children === 'function' ? children(values) : children}
          <Icon
            icon="lucide:chevron-down"
            aria-hidden="true"
            className="size-4 opacity-50"
          />
        </>
      )}
    </Button>
  )
}

function SelectHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Header>) {
  return (
    <Header
      className={twMerge(' py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
      {...props}
    />
  )
}

function SelectItem({ className, children, ...props }: ListBoxItemProps) {
  return (
    <ListBoxItem
      className={values =>
        twMerge(
          'data-[focused]:bg-accent data-[focused]:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    >
      {values => (
        <>
          {values.isSelected && (
            <span className="absolute left-2 flex size-4 items-center justify-center">
              <Icon icon="lucide:check" className="size-4" />
            </span>
          )}
          {typeof children === 'function' ? children(values) : children}
        </>
      )}
    </ListBoxItem>
  )
}

function SelectSeparator({ className, ...props }: SeparatorProps) {
  return (
    <Separator
      className={twMerge('bg-muted -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

function SelectPopover({ className, offset = 0, ...props }: PopoverProps) {
  return (
    <Popover
      offset={offset}
      className={values =>
        twMerge(
          'bg-popover text-popover-foreground data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 relative z-50 w-[--trigger-width] min-w-32 overflow-y-auto rounded-md border shadow-md',
          'data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 data-[placement=bottom]:translate-y-1 data-[placement=left]:-translate-x-1 data-[placement=right]:translate-x-1 data-[placement=top]:-translate-y-1',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

function SelectContent<T extends object>({
  className,
  ...props
}: ListBoxProps<T>) {
  return (
    <ListBox
      className={values =>
        twMerge(
          'p-1',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

export {
  _Select as Select,
  SelectCollection,
  SelectContent,
  SelectHeader,
  SelectItem,
  SelectPopover,
  SelectSection,
  SelectSeparator,
  SelectTrigger,
  _SelectValue as SelectValue,
}
export type { PopoverProps as SelectPopoverProps }
