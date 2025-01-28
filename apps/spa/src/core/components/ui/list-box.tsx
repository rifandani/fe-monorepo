'use client'

import type {
  ListBoxItemProps as ListBoxItemPrimitiveProps,
  ListBoxProps,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import { composeRenderProps, ListBoxItem, ListBox as ListBoxPrimitive } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'

import { DropdownItemDetails, DropdownSection } from './dropdown'
import { composeTailwindRenderProps } from './primitive'

const listBoxStyles = tv({
  base: 'flex max-h-96 w-full min-w-56 flex-col gap-y-1 overflow-y-auto rounded-xl border p-1 shadow-lg outline-hidden [scrollbar-width:thin] [&::-webkit-scrollbar]:size-0.5',
})

function ListBox<T extends object>({ className, ...props }: ListBoxProps<T>) {
  return (
    <ListBoxPrimitive
      {...props}
      className={composeRenderProps(className, (className, renderProps) =>
        listBoxStyles({ ...renderProps, className }))}
    />
  )
}

const listBoxItemStyles = tv({
  base: 'lbi relative cursor-pointer rounded-[calc(var(--radius-lg)-1px)] p-2 text-base outline-hidden sm:text-sm',
  variants: {
    isFocusVisible: {
      true: 'bg-secondary text-accent-fg text-accent-fg/70',
    },
    isHovered: {
      true: 'bg-accent text-accent-fg [&:hover_[slot=description]]:text-accent-fg/70 [&:hover_[slot=label]]:text-accent-fg [&_.text-muted-fg]:text-accent-fg/80',
    },
    isFocused: {
      true: 'bg-accent text-accent-fg **:data-[slot=icon]:text-accent-fg **:data-[slot=label]:text-accent-fg [&_.text-muted-fg]:text-accent-fg/80',
    },
    isSelected: {
      true: 'bg-accent text-accent-fg **:data-[slot=icon]:text-accent-fg **:data-[slot=label]:text-accent-fg [&_.text-muted-fg]:text-accent-fg/80',
    },
    isDragging: { true: 'cursor-grabbing bg-secondary text-secondary-fg' },
    isDisabled: {
      true: 'cursor-default text-muted-fg opacity-70',
    },
  },
})

interface ListBoxItemProps<T extends object> extends ListBoxItemPrimitiveProps<T> {
  className?: string
}

function Item<T extends object>({ children, className, ...props }: ListBoxItemProps<T>) {
  const textValue = typeof children === 'string' ? children : undefined

  return (
    <ListBoxItem
      textValue={textValue}
      {...props}
      className={composeRenderProps(className, (className, renderProps) =>
        listBoxItemStyles({
          ...renderProps,
          className,
        }))}
    >
      {values => (
        <div className="flex items-center gap-2">
          <>
            {values.allowsDragging && (
              <Icon
                icon="ion:menu"
                className={twMerge(
                  'text-muted-fg size-4 shrink-0 transition',
                  values.isFocused && 'text-fg',
                  values.isDragging && 'text-fg',
                  values.isSelected && 'text-accent-fg/70',
                )}
              />
            )}
            <div className="flex flex-col">
              {typeof children === 'function' ? children(values) : children}

              {values.isSelected && (
                <span className="animate-in absolute right-2 top-3 lg:top-2.5">
                  <Icon icon="ion:checkmark" />
                </span>
              )}
            </div>
          </>
        </div>
      )}
    </ListBoxItem>
  )
}

type ListBoxPickerProps<T> = ListBoxProps<T>

function ListBoxPicker<T extends object>({ className, ...props }: ListBoxPickerProps<T>) {
  return (
    <ListBoxPrimitive
      className={composeTailwindRenderProps(
        className,
        'grid max-h-72 grid-cols-[auto_1fr] overflow-auto p-1 outline-hidden *:[[role=\'group\']+[role=group]]:mt-4 *:[[role=\'group\']+[role=separator]]:mt-1',
      )}
      {...props}
    />
  )
}

function Section({ className, ...props }: React.ComponentProps<typeof DropdownSection>) {
  return (
    <DropdownSection className={twMerge(className, 'gap-y-1 [&_.lbi:last-child]:-mb-1.5')} {...props} />
  )
}

ListBox.Section = Section
ListBox.ItemDetails = DropdownItemDetails
ListBox.Item = Item
ListBox.Picker = ListBoxPicker

export type { ListBoxItemProps, ListBoxPickerProps }
export { ListBox, listBoxStyles }
