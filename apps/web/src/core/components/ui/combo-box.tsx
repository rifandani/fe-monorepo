'use client'

import type { ComboBoxProps as ComboboxPrimitiveProps, InputProps, PopoverProps as PopoverPrimitiveProps, ValidationResult } from 'react-aria-components'
import { Icon } from '@iconify/react'
import React from 'react'
import { Button as ButtonPrimitive, ComboBoxContext, ComboBox as ComboboxPrimitive, ComboBoxStateContext, useSlottedContext } from 'react-aria-components'
import { tv } from 'tailwind-variants'
import { Button } from './button'
import { DropdownItem, DropdownLabel, DropdownSection } from './dropdown'
import { Description, FieldError, FieldGroup, Input, Label } from './field'
import { ListBox } from './list-box'
import { Popover } from './popover'
import { composeTailwindRenderProps } from './primitive'

const comboboxStyles = tv({
  slots: {
    base: 'group flex w-full flex-col gap-y-1.5',
    chevronButton:
      'h-7 w-8 rounded outline-offset-0 active:bg-transparent data-hovered:bg-transparent data-pressed:bg-transparent **:data-[slot=icon]:data-pressed:text-fg **:data-[slot=icon]:text-muted-fg **:data-[slot=icon]:hover:text-fg',
    chevronIcon: 'size-4 shrink-0 transition duration-200 group-open:rotate-180 group-open:text-fg',
    clearButton:
      'absolute inset-y-0 right-0 flex items-center pr-2 text-muted-fg data-hovered:text-fg data-focused:outline-hidden',
  },
})

const { base, chevronButton, chevronIcon, clearButton } = comboboxStyles()

interface ComboBoxProps<T extends object> extends Omit<ComboboxPrimitiveProps<T>, 'children'> {
  label?: string
  placeholder?: string
  description?: string | null
  errorMessage?: string | ((validation: ValidationResult) => string)
  children: React.ReactNode
}

function ComboBox<T extends object>({
  label,
  description,
  errorMessage,
  children,
  className,
  ...props
}: ComboBoxProps<T>) {
  return (
    <ComboboxPrimitive {...props} className={composeTailwindRenderProps(className, base())}>
      {label && <Label>{label}</Label>}
      {children}
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </ComboboxPrimitive>
  )
}

type ListBoxPickerProps<T extends object> = React.ComponentProps<typeof ListBox<T>>

interface ComboBoxListProps<T extends object>
  extends ListBoxPickerProps<T>,
  Omit<PopoverPrimitiveProps, 'children' | 'className' | 'style'> {}

function ComboBoxList<T extends object>({ children, items, ...props }: ComboBoxListProps<T>) {
  return (
    <Popover.Picker trigger="ComboBox" isNonModal placement={props.placement}>
      <ListBox.Picker items={items} {...props}>
        {children}
      </ListBox.Picker>
    </Popover.Picker>
  )
}

function ComboBoxInput(props: InputProps) {
  const context = useSlottedContext(ComboBoxContext)!
  return (
    <FieldGroup className="relative pl-0">
      <Input {...props} />
      <Button size="square-petite" appearance="plain" className={chevronButton()}>
        {!context?.inputValue && <Icon icon="ion:chevron-down-outline" className={chevronIcon()} />}
      </Button>
      {context?.inputValue && <ComboBoxClearButton />}
    </FieldGroup>
  )
}

function ComboBoxClearButton() {
  const state = React.use(ComboBoxStateContext)

  return (
    <ButtonPrimitive
      className={clearButton()}
      slot={null}
      aria-label="Clear"
      onPress={() => {
        state?.setSelectedKey(null)
        state?.open()
      }}
    >
      <Icon icon="ion:close-outline" className="animate-in size-4" />
    </ButtonPrimitive>
  )
}

ComboBox.Input = ComboBoxInput
ComboBox.List = ComboBoxList
ComboBox.Option = DropdownItem
ComboBox.Label = DropdownLabel
ComboBox.Section = DropdownSection

export type { ComboBoxListProps, ComboBoxProps }
export { ComboBox }
