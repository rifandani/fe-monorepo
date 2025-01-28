'use client'

import type { ButtonProps, DialogProps } from 'react-aria-components'
import {
  animate,
  AnimatePresence,
  type Inertia,
  motion,
  type PanInfo,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from 'motion/react'
import { createContext, use, useCallback, useMemo, useState } from 'react'
import { Modal, ModalOverlay } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

import { Dialog } from './dialog'

const inertiaTransition: Inertia = {
  type: 'inertia',
  bounceStiffness: 300,
  bounceDamping: 60,
  timeConstant: 300,
}
const staticTransition = {
  duration: 0.4,
  ease: [0.32, 0.72, 0, 1],
}
const drawerMargin = 60
const drawerRadius = 32

interface DrawerContextType {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  withNotch?: boolean
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined)

function useDrawerContext() {
  const context = use(DrawerContext)
  if (context === undefined) {
    throw new Error('useDrawerContext must be used within a Drawer')
  }
  return context
}

function ModalWrapper({ ref, ...props }: React.ComponentProps<typeof Modal>) {
  return <Modal ref={ref} {...props} />
}

function ModalOverlayWrapper({ ref, ...props }: React.ComponentProps<typeof ModalOverlay>) {
  return <ModalOverlay ref={ref} {...props} />
}

const ModalPrimitive = motion.create(ModalWrapper)
const ModalOverlayPrimitive = motion.create(ModalOverlayWrapper)

interface DrawerOverlayPrimitiveProps
  extends Omit<
    React.ComponentProps<typeof ModalOverlayPrimitive>,
    'isOpen' | 'onOpenChange' | 'style'
  > {
  'aria-label'?: DialogProps['aria-label']
  'aria-labelledby'?: DialogProps['aria-labelledby']
  'role'?: DialogProps['role']
  'children'?: React.ReactNode
}

function DrawerContentPrimitive({ children, ...props }: DrawerOverlayPrimitiveProps) {
  const { closeDrawer, withNotch } = useDrawerContext()
  const [contentHeight, setContentHeight] = useState(0)

  const h = Math.min(contentHeight + drawerMargin, window.innerHeight - drawerMargin)
  const y = useMotionValue(h)
  const bgOpacity = useTransform(y, [0, h], [0.15, 0])
  const bg = useMotionTemplate`rgba(0, 0, 0, ${bgOpacity})`

  const root = document.getElementsByTagName('main')[0] as HTMLElement

  const bodyBorderRadius = useTransform(y, [0, h], [drawerRadius, 0])

  useMotionValueEvent(bodyBorderRadius, 'change', (v) => {
    root.style.borderRadius = `${v}px`
  })

  const onDragEnd = (_: any, { offset, velocity }: PanInfo) => {
    if (offset.y > h * 0.4 || velocity.y > 10) {
      closeDrawer()
    }
    else {
      animate(y, 0, { ...inertiaTransition, min: 0, max: 0 })
    }
  }

  return (
    <>
      <ModalOverlayPrimitive
        isDismissable
        isOpen
        onOpenChange={closeDrawer}
        className={twMerge(
          'h-(--visual-viewport-height) fixed left-0 top-0 isolate z-50 w-full touch-none will-change-transform',
          'flex items-end [--visual-viewport-vertical-padding:100px]',
        )}
        style={{
          backgroundColor: bg as any,
        }}
      >
        <ModalPrimitive
          className={twMerge(
            'bg-overlay text-overlay-fg flex max-h-full w-full flex-col overflow-hidden rounded-t-2xl text-left align-middle shadow-lg sm:rounded-lg',
            'ring-dark/5 dark:ring-light/15 ring-1',
          )}
          initial={{ y: h }}
          animate={{ y: 0 }}
          exit={{ y: h }}
          transition={staticTransition}
          style={{
            y,
            top: 'auto',
            height: contentHeight > 0 ? `${contentHeight + drawerMargin}px` : 'auto',
            maxHeight: `calc(100% - ${drawerMargin}px)`,
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: h }}
          onDragEnd={onDragEnd}
          {...props}
        >
          <div className="overflow-hidden">
            {withNotch && (
              <div className="notch bg-fg/20 sticky top-0 mx-auto mt-2.5 h-1.5 w-10 shrink-0 touch-pan-y rounded-full" />
            )}
            <div
              className="mt-3 overflow-y-auto"
              ref={(el) => {
                if (el) {
                  const resizeObserver = new ResizeObserver((entries) => {
                    for (const entry of entries) {
                      setContentHeight(entry.contentRect.height)
                    }
                  })
                  resizeObserver.observe(el)
                  return () => resizeObserver.disconnect()
                }
              }}
            >
              {children}
            </div>
          </div>
        </ModalPrimitive>
      </ModalOverlayPrimitive>
    </>
  )
}

interface DrawerPrimitiveProps extends Omit<React.ComponentProps<typeof Modal>, 'children'> {
  'aria-label'?: DialogProps['aria-label']
  'aria-labelledby'?: DialogProps['aria-labelledby']
  'role'?: DialogProps['role']
  'children'?: DialogProps['children']
}

function DrawerPrimitive({ children }: DrawerPrimitiveProps) {
  const { isOpen } = useDrawerContext()

  const h = window.innerHeight - drawerMargin
  const y = useMotionValue(h)
  const bodyBorderRadius = useTransform(y, [0, h], [drawerRadius, 0])
  return (
    <motion.div
      style={{
        borderRadius: bodyBorderRadius,
        transformOrigin: 'center 0',
      }}
    >
      <AnimatePresence>{isOpen && (children as React.ReactNode)}</AnimatePresence>
    </motion.div>
  )
}

function DrawerTrigger(props: ButtonProps) {
  const { openDrawer } = useDrawerContext()

  return <Dialog.Trigger onPress={openDrawer} {...props} />
}

interface DrawerProps {
  children: React.ReactNode
  isOpen?: boolean
  withNotch?: boolean
  onOpenChange?: (isOpen: boolean) => void
}

function Drawer({
  children,
  withNotch = true,
  isOpen: controlledIsOpen,
  onOpenChange,
}: DrawerProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)

  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  const openDrawer = useCallback(() => {
    if (isControlled && onOpenChange) {
      onOpenChange(true)
    }
    else {
      setInternalIsOpen(true)
    }
  }, [isControlled, onOpenChange])

  const closeDrawer = useCallback(() => {
    if (isControlled && onOpenChange) {
      onOpenChange(false)
    }
    else {
      setInternalIsOpen(false)
    }
  }, [isControlled, onOpenChange])

  const value = useMemo(() => ({ isOpen, openDrawer, closeDrawer, withNotch }), [
    isOpen,
    openDrawer,
    closeDrawer,
    withNotch,
  ])

  if (typeof window === 'undefined') {
    return null
  }

  return (
    <DrawerContext.Provider value={value}>
      {children}
    </DrawerContext.Provider>
  )
}

type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive>
function Content({ children, ...props }: DrawerContentProps) {
  return (
    <DrawerPrimitive>
      <DrawerContentPrimitive {...props}>
        <Dialog
          role={props.role ?? 'dialog'}
          aria-label={props['aria-label'] ?? undefined}
          aria-labelledby={props['aria-labelledby'] ?? undefined}
          className="mx-auto sm:max-w-lg"
        >
          {values => <>{typeof children === 'function' ? children(values) : children}</>}
        </Dialog>
      </DrawerContentPrimitive>
    </DrawerPrimitive>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<typeof Dialog.Header>) {
  return <Dialog.Header className={twMerge('pt-2', className)} {...props} />
}

function DrawerBody({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Body>) {
  return (
    <Dialog.Body {...props} className={twMerge('px-4', className)}>
      {children}
    </Dialog.Body>
  )
}

function DrawerFooter({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Dialog.Footer>) {
  return (
    <Dialog.Footer {...props} className={twMerge('pb-2', className)}>
      {children}
    </Dialog.Footer>
  )
}

Drawer.Body = DrawerBody
Drawer.Close = Dialog.Close
Drawer.Content = Content
Drawer.Description = Dialog.Description
Drawer.Footer = DrawerFooter
Drawer.Header = DrawerHeader
Drawer.Title = Dialog.Title
Drawer.Trigger = DrawerTrigger

export type { DrawerContentProps, DrawerProps }
export { Drawer }
