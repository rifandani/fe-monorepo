'use client'

import type * as React from 'react'
import { Icon } from '@iconify/react'
import {
  Button,
  Collection,
  ComboBox,
  Group,
  Header,
  Input,
  type InputProps,
  ListBox,
  ListBoxItem,
  type ListBoxItemProps,
  type ListBoxProps,
  Popover,
  type PopoverProps,
  Section,
  Separator,
  type SeparatorProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const Combobox = ComboBox

const ComboboxSection = Section

const ComboboxCollection = Collection

function ComboboxInput({ className, ...props }: InputProps) {
  return (
    <Group
      className={twMerge(
        'border-input bg-background ring-offset-background data-[focus-within]:ring-ring  group flex h-10 items-center justify-between overflow-hidden rounded-md border text-sm data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-offset-2 group-data-[disabled]:cursor-not-allowed group-data-[disabled]:opacity-50',
      )}
    >
      <Input
        className={values =>
          twMerge(
            'bg-background placeholder:text-muted-foreground flex w-full px-3 py-2 text-sm data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[focused]:outline-none',
            typeof className === 'function' ? className(values) : className,
          )}
        {...props}
      />
      <Button className="pr-3">
        <Icon
          icon="lucide:chevrons-up-down"
          aria-hidden="true"
          className="size-4 opacity-50"
        />
      </Button>
    </Group>
  )
}

export interface ComboboxLabelProps
  extends React.ComponentPropsWithoutRef<typeof Header> {
  separator?: boolean
  offset?: boolean
}

function ComboboxLabel({
  className,
  separator = false,
  offset = false,
  ...props
}: ComboboxLabelProps) {
  return (
    <Header
      className={twMerge(
        ' py-1.5 pl-8 pr-2 text-sm font-semibold',
        separator && 'border-b-border -mx-1 mb-1 border-b px-3 pb-2.5',
        offset && 'px-3',
        className,
      )}
      {...props}
    />
  )
}

function ComboboxItem({ className, children, ...props }: ListBoxItemProps) {
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

function ComboboxSeparator({ className, ...props }: SeparatorProps) {
  return (
    <Separator
      className={twMerge('bg-muted -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

function ComboboxPopover({ className, ...props }: PopoverProps) {
  return (
    <Popover
      className={values =>
        twMerge(
          'bg-popover text-popover-foreground data-[entering]:animate-in  data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 relative z-50 w-[--trigger-width] overflow-y-auto rounded-md border shadow-md',
          'data-[placement=bottom]:translate-y-1 data-[placement=left]:-translate-x-1 data-[placement=right]:translate-x-1 data-[placement=top]:-translate-y-1',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

function ComboboxListBox<T extends object>({
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
  Combobox,
  ComboboxCollection,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxListBox,
  ComboboxPopover,
  ComboboxSection,
  ComboboxSeparator,
}
