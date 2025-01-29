'use client'

import type { MenuContentProps } from './menu'
import { createContext, use, useMemo, useRef, useState } from 'react'

import { tv } from 'tailwind-variants'
import { Menu } from './menu'
import { focusButtonStyles } from './primitive'

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

  const value = useMemo(() => ({ buttonRef, contextMenuOffset, setContextMenuOffset }), [
    buttonRef,
    contextMenuOffset,
    setContextMenuOffset,
  ])

  return (
    <ContextMenuTriggerContext value={value}>
      {children}
    </ContextMenuTriggerContext>
  )
}

const contextMenuTriggerStyles = tv({
  extend: focusButtonStyles,
  base: 'cursor-default data-focused:outline-hidden',
  variants: {
    isDisabled: {
      false: 'forced-colors:data-disabled:text-[GrayText]',
      true: 'cursor-default opacity-60 forced-colors:data-disabled:text-[GrayText]',
    },
  },
})

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
      type="submit"
      className={contextMenuTriggerStyles({ isDisabled: props.disabled, className })}
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

ContextMenu.Trigger = ContextMenuTrigger
ContextMenu.Content = ContextMenuContent
ContextMenu.Item = Menu.Item
ContextMenu.Separator = Menu.Separator
ContextMenu.ItemDetails = Menu.ItemDetails
ContextMenu.Section = Menu.Section
ContextMenu.Header = Menu.Header
ContextMenu.Keyboard = Menu.Keyboard

export type { ContextMenuProps }
export { ContextMenu }
