"use client"

import {
  Menu,
  type MenuProps,
  MenuDescription,
  MenuHeader,
  MenuItem,
  MenuLabel,
  MenuSection,
  MenuSeparator,
  MenuShortcut,
  MenuSubMenu,
} from "./menu"
import { MenuTrigger, type MenuTriggerProps } from "react-aria-components/Menu"
import type { PopoverProps } from "@/core/components/ui/popover"

function ContextMenu(props: Omit<MenuTriggerProps, "trigger">) {
  return <MenuTrigger trigger="contextMenu" {...props} />
}

function ContextMenuContent({
  placement = "bottom start",
  offset = 4,
  crossOffset = 0,
  children,
  ...props
}: Omit<MenuProps<object>, "children" | "placement" | "popover"> &
  Pick<PopoverProps, "placement" | "offset" | "crossOffset"> & {
    children?: React.ReactNode
  }) {
  return (
    <Menu
      popover={{
        placement,
        offset,
        crossOffset,
      }}
      {...props}
    >
      {children}
    </Menu>
  )
}

const ContextMenuItem = MenuItem
const ContextMenuSeparator = MenuSeparator
const ContextMenuDescription = MenuDescription
const ContextMenuSection = MenuSection
const ContextMenuHeader = MenuHeader
const ContextMenuShortcut = MenuShortcut
const ContextMenuLabel = MenuLabel
const ContextMenuSub = MenuSubMenu

export {
  ContextMenu,
  ContextMenuSub,
  ContextMenuContent,
  ContextMenuDescription,
  ContextMenuHeader,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSection,
  ContextMenuSeparator,
  ContextMenuShortcut,
}
