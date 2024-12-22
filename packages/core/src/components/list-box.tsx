'use client'

import type {
  ListBoxItemProps as AriaListBoxItemProps,
  ListBoxProps as AriaListBoxProps,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import {
  Collection as AriaCollection,
  Header as AriaHeader,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  composeRenderProps,
  MenuSection,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const ListBoxSection = MenuSection

const ListBoxCollection = AriaCollection

function ListBox<T extends object>({
  className,
  ...props
}: AriaListBoxProps<T>) {
  return (
    <AriaListBox
      className={composeRenderProps(className, className =>
        twMerge(
          className,
          'bg-popover text-popover-foreground group overflow-auto rounded-md border p-1 shadow-md outline-none',
          /* Empty */
          'data-[empty]:p-6 data-[empty]:text-center data-[empty]:text-sm',
        ))}
      {...props}
    />
  )
}

function ListBoxItem<T extends object>({
  className,
  children,
  ...props
}: AriaListBoxItemProps<T>) {
  return (
    <AriaListBoxItem
      textValue={
        props.textValue || (typeof children === 'string' ? children : undefined)
      }
      className={composeRenderProps(className, className =>
        twMerge(
          'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          /* Disabled */
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          /* Focused */
          'data-[focused]:bg-accent data-[focused]:text-accent-foreground',
          /* Hovered */
          'data-[hovered]:bg-accent data-[hovered]:text-accent-foreground',
          /* Selection */
          'data-[selection-mode]:pl-8',
          className,
        ))}
      {...props}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          {renderProps.isSelected && (
            <span className="absolute left-2 flex size-4 items-center justify-center">
              <Icon icon="lucide:check" className="size-4" />
            </span>
          )}
          {children}
        </>
      ))}
    </AriaListBoxItem>
  )
}

function ListBoxHeader({
  className,
  ...props
}: React.ComponentProps<typeof AriaHeader>) {
  return (
    <AriaHeader
      className={twMerge('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
      {...props}
    />
  )
}

export {
  ListBox,
  ListBoxCollection,
  ListBoxHeader,
  ListBoxItem,
  ListBoxSection,
}
