'use client'

import type { Placement } from '@react-types/overlays'
import type {
  ListBoxProps,
  SelectProps as SelectPrimitiveProps,
  ValidationResult,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import {
  Button,
  composeRenderProps,
  Select as SelectPrimitive,
  SelectValue,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'
import {
  DropdownItem,
  DropdownItemDetails,
  DropdownLabel,
  DropdownSection,
  DropdownSeparator,
} from './dropdown'
import { Description, FieldError, Label } from './field'
import { ListBox } from './list-box'
import { Popover } from './popover'
import { composeTailwindRenderProps, focusStyles } from './primitive'

const selectTriggerStyles = tv({
  extend: focusStyles,
  base: [
    'btr flex h-10 w-full cursor-default items-center gap-4 gap-x-2 rounded-lg border border-input py-2 pr-2 pl-3 text-start shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition **:data-[slot=icon]:size-4 group-data-disabled:opacity-50 dark:shadow-none',
    'group-data-open:border-ring/70 group-data-open:ring-4 group-data-open:ring-ring/20',
    'text-fg group-data-invalid:border-danger group-data-invalid:ring-danger/20 forced-colors:group-data-invalid:border-[Mark]',
  ],
  variants: {
    isDisabled: {
      true: 'opacity-50 forced-colors:border-[GrayText] forced-colors:text-[GrayText]',
    },
  },
})

interface SelectProps<T extends object> extends SelectPrimitiveProps<T> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
  items?: Iterable<T>
  className?: string
}

function Select<T extends object>({
  label,
  description,
  errorMessage,
  children,
  className,
  ...props
}: SelectProps<T>) {
  return (
    <SelectPrimitive
      {...props}
      className={composeTailwindRenderProps(className, 'group flex w-full flex-col gap-y-1.5')}
    >
      {label && <Label>{label}</Label>}
      {children as React.ReactNode}
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </SelectPrimitive>
  )
}

interface ListProps<T extends object> extends ListBoxProps<T> {
  items?: Iterable<T>
  placement?: Placement
  children: React.ReactNode | ((item: T) => React.ReactNode)
  className?: string
}

function List<T extends object>({
  className,
  children,
  items,
  placement,
  ...props
}: ListProps<T>) {
  return (
    <Popover.Picker className={className} placement={placement}>
      <ListBox.Picker aria-label="items" items={items} {...props}>
        {children}
      </ListBox.Picker>
    </Popover.Picker>
  )
}

interface SelectTriggerProps extends React.ComponentProps<typeof Button> {
  prefix?: React.ReactNode
  className?: string
}

function SelectTrigger({ className, ...props }: SelectTriggerProps) {
  return (
    <Button
      className={composeRenderProps(className, (className, renderProps) =>
        selectTriggerStyles({
          ...renderProps,
          className,
        }))}
    >
      {props.prefix && <span className="-mr-1">{props.prefix}</span>}
      <SelectValue className="data-placeholder:text-muted-fg grid flex-1 grid-cols-[auto_1fr] items-center text-base *:data-[slot=avatar]:*:-mx-0.5 *:data-[slot=avatar]:-mx-0.5 *:data-[slot=icon]:-mx-0.5 *:data-[slot=avatar]:*:mr-2 *:data-[slot=avatar]:mr-2 *:data-[slot=icon]:mr-2 sm:text-sm [&_[slot=description]]:hidden" />
      <Icon
        icon="ion:chevron-down"
        aria-hidden
        className="text-muted-fg group-data-open:rotate-180 group-data-open:text-fg group-data-disabled:opacity-50 forced-colors:group-data-disabled:text-[GrayText] size-4 shrink-0 duration-300 forced-colors:text-[ButtonText]"
      />
    </Button>
  )
}

Select.OptionDetails = DropdownItemDetails
Select.Option = DropdownItem
Select.Label = DropdownLabel
Select.Separator = DropdownSeparator
Select.Section = DropdownSection
Select.Trigger = SelectTrigger
Select.List = List

export type { SelectProps, SelectTriggerProps }
export { Select }
