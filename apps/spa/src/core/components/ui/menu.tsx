'use client'

import type {
  ButtonProps,
  MenuItemProps as MenuItemPrimitiveProps,
  MenuProps as MenuPrimitiveProps,
  MenuSectionProps as MenuSectionPrimitiveProps,
  MenuTriggerProps as MenuTriggerPrimitiveProps,
  PopoverProps,
} from 'react-aria-components'
import type { VariantProps } from 'tailwind-variants'
import { Icon } from '@iconify/react'
import { createContext, use } from 'react'
import {
  Button,
  Collection,
  composeRenderProps,
  Header,
  MenuItem,
  Menu as MenuPrimitive,
  MenuSection,
  MenuTrigger as MenuTriggerPrimitive,
  SubmenuTrigger as SubmenuTriggerPrimitive,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { tv } from 'tailwind-variants'
import {
  DropdownItemDetails,
  dropdownItemStyles,
  DropdownKeyboard,
  DropdownLabel,
  dropdownSectionStyles,
  DropdownSeparator,
} from './dropdown'
import { Popover } from './popover'

interface MenuContextProps {
  respectScreen: boolean
}

const MenuContext = createContext<MenuContextProps>({ respectScreen: true })

interface MenuProps extends MenuTriggerPrimitiveProps {
  respectScreen?: boolean
}

function Menu({ respectScreen = true, ...props }: MenuProps) {
  return (
    <MenuContext value={{ respectScreen }}>
      <MenuTriggerPrimitive {...props}>{props.children}</MenuTriggerPrimitive>
    </MenuContext>
  )
}

function SubMenu({ delay = 0, ...props }) {
  return (
    <SubmenuTriggerPrimitive {...props} delay={delay}>
      {props.children}
    </SubmenuTriggerPrimitive>
  )
}

const menuStyles = tv({
  slots: {
    menu: 'grid max-h-[calc(var(--visual-viewport-height)-10rem)] grid-cols-[auto_1fr] overflow-auto rounded-xl p-1 outline-hidden [clip-path:inset(0_0_0_0_round_calc(var(--radius-lg)-2px))] sm:max-h-[inherit] *:[[role=\'group\']+[role=group]]:mt-4 *:[[role=\'group\']+[role=separator]]:mt-1',
    popover: 'z-50 p-0 shadow-xs outline-hidden sm:min-w-40',
    trigger: [
      'relative inline text-left outline-hidden data-focus-visible:ring-1 data-focus-visible:ring-primary',
    ],
  },
})

const { menu, popover, trigger } = menuStyles()

interface MenuTriggerProps extends ButtonProps {
  className?: string
  ref?: React.Ref<HTMLButtonElement>
}

function MenuTrigger({ className, ref, ...props }: MenuTriggerProps) {
  return (
    <Button ref={ref} data-slot="menu-trigger" className={trigger({ className })} {...props}>
      {values => (
        <>{typeof props.children === 'function' ? props.children(values) : props.children}</>
      )}
    </Button>
  )
}

interface MenuContentProps<T>
  extends Omit<PopoverProps, 'children' | 'style'>,
  MenuPrimitiveProps<T> {
  className?: string
  popoverClassName?: string
  showArrow?: boolean
  respectScreen?: boolean
}

function MenuContent<T extends object>({
  className,
  showArrow = false,
  popoverClassName,
  ...props
}: MenuContentProps<T>) {
  const { respectScreen } = use(MenuContext)
  return (
    <Popover.Content
      respectScreen={respectScreen}
      showArrow={showArrow}
      className={popover({
        className: popoverClassName,
      })}
      {...props}
    >
      <MenuPrimitive className={menu({ className })} {...props} />
    </Popover.Content>
  )
}

interface MenuItemProps extends MenuItemPrimitiveProps, VariantProps<typeof dropdownItemStyles> {
  isDanger?: boolean
}

function Item({ className, isDanger = false, children, ...props }: MenuItemProps) {
  const textValue = props.textValue || (typeof children === 'string' ? children : undefined)
  return (
    <MenuItem
      className={composeRenderProps(className, (className, renderProps) =>
        dropdownItemStyles({
          ...renderProps,
          className: renderProps.hasSubmenu
            ? twMerge([
                'data-open:data-danger:bg-danger/20 data-open:data-danger:text-danger',
                'data-open:bg-accent data-open:text-accent-fg data-open:*:data-[slot=icon]:text-accent-fg data-open:*:[.text-muted-fg]:text-accent-fg',
                className,
              ])
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
                  className="**:data-[slot=indicator]:size-2.5 **:data-[slot=indicator]:shrink-0 -mx-0.5 mr-2 flex size-4 shrink-0 items-center justify-center"
                >
                  <Icon icon="ion:ios-circle-filled" data-slot="indicator" />
                </span>
              )}
              {values.selectionMode === 'multiple' && (
                <Icon icon="ion:checkmark" className="-mx-0.5 mr-2 size-4" data-slot="checked-icon" />
              )}
            </>
          )}

          {typeof children === 'function' ? children(values) : children}

          {values.hasSubmenu && (
            <Icon icon="ion:chevron-forward-outline" data-slot="chevron" className="absolute right-2 size-3.5" />
          )}
        </>
      )}
    </MenuItem>
  )
}

export interface MenuHeaderProps extends React.ComponentProps<typeof Header> {
  separator?: boolean
}

function MenuHeader({ className, separator = false, ...props }: MenuHeaderProps) {
  return (
    <Header
      className={twMerge(
        'col-span-full px-2.5 py-2 text-base font-semibold sm:text-sm',
        separator && '-mx-1 mb-1 border-b sm:px-3 sm:pb-2.5',
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

function Section<T extends object>({ className, ref, ...props }: MenuSectionProps<T>) {
  return (
    <MenuSection ref={ref} className={section({ className })} {...props}>
      {'title' in props && <Header className={header()}>{props.title}</Header>}
      <Collection items={props.items}>{props.children}</Collection>
    </MenuSection>
  )
}

Menu.Keyboard = DropdownKeyboard
Menu.Primitive = MenuPrimitive
Menu.Content = MenuContent
Menu.Header = MenuHeader
Menu.Item = Item
Menu.Section = Section
Menu.Separator = DropdownSeparator
Menu.Trigger = MenuTrigger
Menu.ItemDetails = DropdownItemDetails
Menu.Submenu = SubMenu
Menu.Label = DropdownLabel

export type { MenuContentProps, MenuItemProps, MenuProps, MenuSectionProps, MenuTriggerProps }
export { Menu }
