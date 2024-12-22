'use client'

import type { buttonVariants } from '@workspace/ui/components/button'
import type { VariantProps } from 'class-variance-authority'
import type {
  MenuItemProps as AriaMenuItemProps,
  MenuProps as AriaMenuProps,
  MenuTriggerProps as AriaMenuTriggerProps,
  SeparatorProps as AriaSeparatorProps,
  PopoverProps,
} from 'react-aria-components'
import { Icon } from '@iconify/react'
import { Button } from '@workspace/ui/components/button'
import { ListBoxCollection, ListBoxSection } from '@workspace/ui/components/list-box'
import { SelectPopover } from '@workspace/ui/components/select'
import * as React from 'react'
import {
  Header as AriaHeader,
  Keyboard as AriaKeyboard,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  Separator as AriaSeparator,
  SubmenuTrigger as AriaSubmenuTrigger,
  composeRenderProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const MenuTrigger = AriaMenuTrigger

const MenuSubTrigger = AriaSubmenuTrigger

const MenuSection = ListBoxSection

const MenuCollection = ListBoxCollection

function MenuPopover({ className, ...props }: PopoverProps) {
  return (
    <SelectPopover
      className={composeRenderProps(className, className =>
        twMerge('w-auto', className))}
      {...props}
    />
  )
}

function Menu<T extends object>({ className, ...props }: AriaMenuProps<T>) {
  return (
    <AriaMenu
      className={twMerge(
        'max-h-[inherit] overflow-auto rounded-md p-1 outline outline-0 [clip-path:inset(0_0_0_0_round_calc(var(--radius)-2px))]',
        className,
      )}
      {...props}
    />
  )
}

function MenuItem({ children, className, ...props }: AriaMenuItemProps) {
  return (
    <AriaMenuItem
      textValue={
        props.textValue || (typeof children === 'string' ? children : undefined)
      }
      className={composeRenderProps(className, className =>
        twMerge(
          'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
          /* Disabled */
          'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          /* Focused */
          'data-[focused]:bg-accent data-[focused]:text-accent-foreground ',
          /* Selection Mode */
          'data-[selection-mode]:pl-8',
          className,
        ))}
      {...props}
    >
      {composeRenderProps(children, (children, renderProps) => (
        <>
          <span className="absolute left-2 flex size-4 items-center justify-center">
            {renderProps.isSelected && (
              <>
                {renderProps.selectionMode === 'single' && (
                  <Icon icon="lucide:circle" className="size-2 fill-current" />
                )}
                {renderProps.selectionMode === 'multiple' && (
                  <Icon icon="lucide:check" className="size-4" />
                )}
              </>
            )}
          </span>

          {children}

          {renderProps.hasSubmenu && <Icon icon="lucide:chevron-right" className="ml-auto size-4" />}
        </>
      ))}
    </AriaMenuItem>
  )
}

interface MenuHeaderProps extends React.ComponentProps<typeof AriaHeader> {
  inset?: boolean
  separator?: boolean
}

function MenuHeader({
  className,
  inset,
  separator = true,
  ...props
}: MenuHeaderProps) {
  return (
    <AriaHeader
      className={twMerge(
        'px-3 py-1.5 text-sm font-semibold',
        inset && 'pl-8',
        separator && 'border-b-border -mx-1 mb-1 border-b pb-2.5',
        className,
      )}
      {...props}
    />
  )
}

function MenuSeparator({ className, ...props }: AriaSeparatorProps) {
  return (
    <AriaSeparator
      className={twMerge('bg-muted -mx-1 my-1 h-px', className)}
      {...props}
    />
  )
}

function MenuKeyboard({
  className,
  ...props
}: React.ComponentProps<typeof AriaKeyboard>) {
  return (
    <AriaKeyboard
      className={twMerge('ml-auto text-xs tracking-widest opacity-60', className)}
      {...props}
    />
  )
}
interface JollyMenuProps<T>
  extends AriaMenuProps<T>,
  VariantProps<typeof buttonVariants>,
  Omit<AriaMenuTriggerProps, 'children'> {
  label?: string
}
function JollyMenu<T extends object>({
  label,
  children,
  variant,
  size,
  ...props
}: JollyMenuProps<T>) {
  return (
    <MenuTrigger {...props}>
      <Button variant={variant} size={size}>
        {label}
      </Button>
      <MenuPopover className="min-w-[--trigger-width]">
        <Menu {...props}>{children}</Menu>
      </MenuPopover>
    </MenuTrigger>
  )
}

export {
  JollyMenu,
  Menu,
  MenuCollection,
  MenuHeader,
  MenuItem,
  MenuKeyboard,
  MenuPopover,
  MenuSection,
  MenuSeparator,
  MenuSubTrigger,
  MenuTrigger,
}
export type { JollyMenuProps, MenuHeaderProps }
