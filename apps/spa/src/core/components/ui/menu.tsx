'use client'

import type {
  ButtonProps,
  MenuItemProps as MenuItemPrimitiveProps,
  MenuProps as MenuPrimitiveProps,
  MenuSectionProps as MenuSectionPrimitiveProps,
  MenuTriggerProps as MenuTriggerPrimitiveProps,
} from 'react-aria-components'
import type { VariantProps } from 'tailwind-variants'
import type { PopoverContentProps } from '@/core/components/ui/popover'
import { Icon } from '@iconify/react'
import {
  Button,
  Collection,
  composeRenderProps,
  Header,
  MenuItem as MenuItemPrimitive,
  Menu as MenuPrimitive,
  MenuSection as MenuSectionPrimitive,
  MenuTrigger as MenuTriggerPrimitive,
  SubmenuTrigger as SubmenuTriggerPrimitive,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import {
  DropdownDescription,
  dropdownItemStyles,
  DropdownKeyboard,
  DropdownLabel,
  dropdownSectionStyles,
  DropdownSeparator,
} from '@/core/components/ui/dropdown'
import { PopoverContent } from '@/core/components/ui/popover'
import { composeTailwindRenderProps } from '@/core/components/ui/primitive'

const Menu = (props: MenuTriggerPrimitiveProps) => <MenuTriggerPrimitive {...props} />

function MenuSubMenu({ delay = 0, ...props }) {
  return (
    <SubmenuTriggerPrimitive {...props} delay={delay}>
      {props.children}
    </SubmenuTriggerPrimitive>
  )
}

interface MenuTriggerProps extends ButtonProps {
  ref?: React.Ref<HTMLButtonElement>
}

function MenuTrigger({ className, ref, ...props }: MenuTriggerProps) {
  return (
    <Button
      ref={ref}
      data-slot="menu-trigger"
      className={composeTailwindRenderProps(
        className,
        'relative inline text-left outline-hidden focus-visible:ring-1 focus-visible:ring-primary',
      )}
      {...props}
    />
  )
}

interface MenuContentProps<T>
  extends MenuPrimitiveProps<T>,
  Pick<PopoverContentProps, 'placement'> {
  className?: string
  popover?: Pick<
    PopoverContentProps,
    | 'showArrow'
    | 'className'
    | 'placement'
    | 'offset'
    | 'crossOffset'
    | 'arrowBoundaryOffset'
    | 'triggerRef'
    | 'isOpen'
    | 'onOpenChange'
    | 'shouldFlip'
  >
  showArrow?: boolean
}

function MenuContent<T extends object>({
  className,
  placement,
  popover,
  ...props
}: MenuContentProps<T>) {
  return (
    <PopoverContent
      className={composeTailwindRenderProps(popover?.className, 'min-w-40')}
      placement={placement}
      {...popover}
    >
      <MenuPrimitive
        data-slot="menu-content"
        className={composeTailwindRenderProps(
          className,
          'grid max-h-[calc(var(--visual-viewport-height)-10rem)] grid-cols-[auto_1fr] overflow-y-auto overscroll-contain p-1 outline-hidden [clip-path:inset(0_0_0_0_round_calc(var(--radius-lg)-2px))] *:[[role=\'group\']+[role=group]]:mt-4 *:[[role=\'group\']+[role=separator]]:mt-1',
        )}
        {...props}
      />
    </PopoverContent>
  )
}

interface MenuItemProps extends MenuItemPrimitiveProps, VariantProps<typeof dropdownItemStyles> {
  isDanger?: boolean
}

function MenuItem({ className, isDanger = false, children, ...props }: MenuItemProps) {
  const textValue = props.textValue || (typeof children === 'string' ? children : undefined)
  return (
    <MenuItemPrimitive
      className={composeRenderProps(className, (className, { hasSubmenu, ...renderProps }) =>
        dropdownItemStyles({
          ...renderProps,
          className: hasSubmenu
            ? twMerge(
                'open:data-danger:bg-danger/10 open:data-danger:text-danger',
                `
                  open:bg-accent open:text-accent-fg
                  open:*:data-[slot=icon]:text-accent-fg
                  open:*:[.text-muted-fg]:text-accent-fg
                `,
                className,
              )
            : className,
        }))}
      textValue={textValue}
      data-danger={isDanger ? 'true' : undefined}
      {...props}
    >
      {values => (
        <>
          {values.isSelected && (
            <>
              {values.selectionMode === 'single' && (
                <span
                  data-slot="bullet-icon"
                  className={`
                    -mx-0.5 mr-2 flex size-4 shrink-0 items-center
                    justify-center
                    **:data-[slot=indicator]:size-2.5
                    **:data-[slot=indicator]:shrink-0
                  `}
                >
                  <Icon icon="mdi:circle-medium" data-slot="indicator" />
                </span>
              )}
              {values.selectionMode === 'multiple' && (
                <Icon icon="lucide:check" className="-mx-0.5 mr-2 size-4" data-slot="check-indicator" />
              )}
            </>
          )}

          {typeof children === 'function' ? children(values) : children}

          {values.hasSubmenu && (
            <Icon
              icon="lucide:chevron-right"
              data-slot="chevron"
              className="absolute right-2 size-3.5"
            />
          )}
        </>
      )}
    </MenuItemPrimitive>
  )
}

export interface MenuHeaderProps extends React.ComponentProps<typeof Header> {
  separator?: boolean
}

function MenuHeader({ className, separator = false, ...props }: MenuHeaderProps) {
  return (
    <Header
      className={twMerge(
        `
          col-span-full px-2.5 py-2 text-base font-semibold
          sm:text-sm
        `,
        separator && `
          -mx-1 mb-1 border-b
          sm:px-3 sm:pb-[0.625rem]
        `,
        className,
      )}
      {...props}
    />
  )
}

const { section, header } = dropdownSectionStyles()

interface MenuSectionProps<T> extends MenuSectionPrimitiveProps<T> {
  ref?: React.Ref<HTMLDivElement>
  title?: string
}

function MenuSection<T extends object>({ className, ref, ...props }: MenuSectionProps<T>) {
  return (
    <MenuSectionPrimitive ref={ref} className={section({ className })} {...props}>
      {'title' in props && <Header className={header()}>{props.title}</Header>}
      <Collection items={props.items}>{props.children}</Collection>
    </MenuSectionPrimitive>
  )
}

const MenuSeparator = DropdownSeparator
const MenuKeyboard = DropdownKeyboard
const MenuLabel = DropdownLabel
const MenuDescription = DropdownDescription

Menu.Keyboard = MenuKeyboard
Menu.Content = MenuContent
Menu.Header = MenuHeader
Menu.Item = MenuItem
Menu.Section = MenuSection
Menu.Separator = MenuSeparator
Menu.Label = MenuLabel
Menu.Description = MenuDescription
Menu.Trigger = MenuTrigger
Menu.Submenu = MenuSubMenu

export type { MenuContentProps, MenuItemProps, MenuSectionProps, MenuTriggerProps }
export { Menu }
