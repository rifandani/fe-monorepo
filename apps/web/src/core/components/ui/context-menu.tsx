'use client'

import type { MenuContentProps } from './menu'
import { createContext, use, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Menu } from './menu'

interface ContextMenuTriggerContextType {
  buttonRef: React.RefObject<HTMLButtonElement | null>
  contextMenuOffset: { offset: number, crossOffset: number } | null
  setContextMenuOffset: React.Dispatch<
    React.SetStateAction<{ offset: number, crossOffset: number } | null>
  >
}

const ContextMenuTriggerContext = createContext<ContextMenuTriggerContextType | undefined>(
  undefined,
)

function useContextMenuTrigger() {
  const context = use(ContextMenuTriggerContext)
  if (!context) {
    throw new Error('useContextMenuTrigger must be used within a ContextMenuTrigger')
  }
  return context
}

interface ContextMenuProps {
  children: React.ReactNode
}

function ContextMenu({ children }: ContextMenuProps) {
  const [contextMenuOffset, setContextMenuOffset] = useState<{
    offset: number
    crossOffset: number
  } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  return (
    <ContextMenuTriggerContext
      value={{ buttonRef, contextMenuOffset, setContextMenuOffset }}
    >
      {children}
    </ContextMenuTriggerContext>
  )
}

type ContextMenuTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

function ContextMenuTrigger({ className, ...props }: ContextMenuTriggerProps) {
  const { buttonRef, setContextMenuOffset } = useContextMenuTrigger()

  const onContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    setContextMenuOffset({
      offset: e.clientY - rect.bottom,
      crossOffset: e.clientX - rect.left,
    })
  }
  return (
    <button
      className={twMerge(
        'cursor-default focus:outline-hidden disabled:opacity-60 disabled:forced-colors:disabled:text-[GrayText]',
        className,
      )}
      ref={buttonRef}
      aria-haspopup="menu"
      onContextMenu={onContextMenu}
      {...props}
    />
  )
}

type ContextMenuContentProps<T> = Omit<
  MenuContentProps<T>,
  'showArrow' | 'isOpen' | 'onOpenChange' | 'triggerRef' | 'placement' | 'shouldFlip'
>

function ContextMenuContent<T extends object>(props: ContextMenuContentProps<T>) {
  const { contextMenuOffset, setContextMenuOffset, buttonRef } = useContextMenuTrigger()
  return contextMenuOffset
    ? (
        <Menu.Content
          isOpen={!!contextMenuOffset}
          onOpenChange={() => setContextMenuOffset(null)}
          triggerRef={buttonRef}
          shouldFlip={false}
          placement="bottom left"
          offset={contextMenuOffset?.offset}
          crossOffset={contextMenuOffset?.crossOffset}
          onClose={() => setContextMenuOffset(null)}
          {...props}
        />
      )
    : null
}

const ContextMenuItem = Menu.Item
const ContextMenuSeparator = Menu.Separator
const ContextMenuItemDetails = Menu.ItemDetails
const ContextMenuSection = Menu.Section
const ContextMenuHeader = Menu.Header
const ContextMenuKeyboard = Menu.Keyboard
const ContextMenuLabel = Menu.Label

ContextMenu.Trigger = ContextMenuTrigger
ContextMenu.Content = ContextMenuContent
ContextMenu.Item = ContextMenuItem
ContextMenu.Label = ContextMenuLabel
ContextMenu.Separator = ContextMenuSeparator
ContextMenu.ItemDetails = ContextMenuItemDetails
ContextMenu.Section = ContextMenuSection
ContextMenu.Header = ContextMenuHeader
ContextMenu.Keyboard = ContextMenuKeyboard

export type { ContextMenuProps }
export { ContextMenu }
