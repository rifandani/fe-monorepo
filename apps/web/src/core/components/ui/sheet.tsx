'use client'

import type { DialogProps, DialogTriggerProps, ModalOverlayProps } from 'react-aria-components'
import type { VariantProps } from 'tailwind-variants'
import {
  composeRenderProps,
  DialogTrigger as DialogTriggerPrimitive,
  Modal,
  ModalOverlay,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogCloseIcon,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/core/components/ui/dialog'

const overlayStyles = tv({
  base: [
    `
      fixed top-0 left-0 isolate z-50 flex h-(--visual-viewport-height) w-full
      items-center justify-center bg-fg/15 p-4
      dark:bg-bg/40
    `,
  ],
  variants: {
    isBlurred: {
      true: `
        bg-bg/15 backdrop-blur
        dark:bg-bg/40
      `,
    },
    isEntering: {
      true: 'animate-in duration-300 ease-out fade-in',
    },
    isExiting: {
      true: 'animate-out duration-200 ease-in fade-out',
    },
  },
})

type Sides = 'top' | 'bottom' | 'left' | 'right'
function generateCompoundVariants(sides: Array<Sides>) {
  return sides.map(side => ({
    side,
    isFloat: true,
    className:
      side === 'top'
        ? 'top-2 inset-x-2 rounded-lg ring-1 border-b-0'
        : side === 'bottom'
          ? 'bottom-2 inset-x-2 rounded-lg ring-1 border-t-0'
          : side === 'left'
            ? 'left-2 inset-y-2 rounded-lg ring-1 border-r-0'
            : 'right-2 inset-y-2 rounded-lg ring-1 border-l-0',
  }))
}

const contentStyles = tv({
  base: `
    fixed z-50 grid gap-4 border-fg/5 bg-overlay text-overlay-fg shadow-lg
    transition ease-in-out
    dark:border-border
  `,
  variants: {
    isEntering: {
      true: 'animate-in duration-300',
    },
    isExiting: {
      true: 'animate-out duration-200',
    },
    side: {
      top: `
        inset-x-0 top-0 rounded-b-2xl border-b
        entering:slide-in-from-top
        exiting:slide-out-to-top
      `,
      bottom:
        `
          inset-x-0 bottom-0 rounded-t-2xl border-t
          entering:slide-in-from-bottom
          exiting:slide-out-to-bottom
        `,
      left: `
        inset-y-0 left-0 h-auto w-full max-w-xs overflow-y-auto border-r
        entering:slide-in-from-left
        exiting:slide-out-to-left
      `,
      right:
        `
          inset-y-0 right-0 h-auto w-full max-w-xs overflow-y-auto border-l
          entering:slide-in-from-right
          exiting:slide-out-to-right
        `,
    },
    isFloat: {
      false: `
        border-fg/20
        dark:border-border
      `,
      true: `
        ring-fg/5
        dark:ring-border
      `,
    },
  },
  compoundVariants: generateCompoundVariants(['top', 'bottom', 'left', 'right']),
})

type SheetProps = DialogTriggerProps
function Sheet(props: SheetProps) {
  return <DialogTriggerPrimitive {...props} />
}

interface SheetContentProps
  extends Omit<ModalOverlayProps, 'children'>,
  Pick<DialogProps, 'aria-label' | 'role' | 'aria-labelledby' | 'children'>,
  VariantProps<typeof overlayStyles> {
  closeButton?: boolean
  isBlurred?: boolean
  isFloat?: boolean
  side?: Sides
  overlay?: Omit<ModalOverlayProps, 'children'>
}

function SheetContent({
  className,
  isBlurred = false,
  isDismissable: isDismissableInternal,
  side = 'right',
  role = 'dialog',
  closeButton = true,
  isFloat = true,
  overlay,
  children,
  ...props
}: SheetContentProps) {
  const isDismissable = isDismissableInternal ?? role !== 'alertdialog'
  return (
    <ModalOverlay
      isDismissable={isDismissable}
      className={composeRenderProps(overlay?.className, (className, renderProps) => {
        return overlayStyles({
          ...renderProps,
          isBlurred,
          className,
        })
      })}
      {...props}
    >
      <Modal
        className={composeRenderProps(className, (className, renderProps) =>
          contentStyles({
            ...renderProps,
            side,
            isFloat,
            className,
          }))}
        {...props}
      >
        <Dialog role={role}>
          {values => (
            <>
              {typeof children === 'function' ? children(values) : children}
              {closeButton && (
                <DialogCloseIcon className="top-2.5 right-2.5" isDismissable={isDismissable} />
              )}
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}

const SheetTrigger = DialogTrigger
const SheetFooter = DialogFooter
const SheetHeader = DialogHeader
const SheetTitle = DialogTitle
const SheetDescription = DialogDescription
const SheetBody = DialogBody
const SheetClose = DialogClose

Sheet.Trigger = SheetTrigger
Sheet.Footer = SheetFooter
Sheet.Header = SheetHeader
Sheet.Title = SheetTitle
Sheet.Description = SheetDescription
Sheet.Body = SheetBody
Sheet.Close = SheetClose
Sheet.Content = SheetContent

export type { SheetContentProps, SheetProps, Sides }
export { Sheet }
