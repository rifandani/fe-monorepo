'use client'

import type * as React from 'react'
import { Icon } from '@iconify/react'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  Button,
  Dialog,
  type DialogProps,
  DialogTrigger,
  Heading,
  type HeadingProps,
  Modal,
  ModalOverlay,
  type ModalOverlayProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const sheetVariants = cva(
  'fixed z-50 gap-4 bg-background shadow-lg transition ease-in-out data-[entering]:duration-500 data-[exiting]:duration-300 data-[entering]:animate-in data-[exiting]:animate-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[entering]:slide-in-from-top data-[exiting]:slide-out-to-top',
        bottom:
          'inset-x-0 bottom-0 border-t data-[entering]:slide-in-from-bottom data-[exiting]:slide-out-to-bottom',
        left: 'inset-y-0 left-0 h-full w-3/4 border-r data-[entering]:slide-in-from-left data-[exiting]:slide-out-to-left sm:max-w-sm',
        right:
          'inset-y-0 right-0 h-full w-3/4  border-l data-[entering]:slide-in-from-right data-[exiting]:slide-out-to-right sm:max-w-sm',
      },
    },
  },
)
export type SheetVariantProps = VariantProps<typeof sheetVariants>

const _DialogTrigger = DialogTrigger

function _DialogOverlay({
  className,
  isDismissable = true,
  ...props
}: ModalOverlayProps) {
  return (
    <ModalOverlay
      isDismissable={isDismissable}
      className={values =>
        twMerge(
          'bg-background data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[entering]:slide-in-from-left-1/2 data-[entering]:slide-in-from-top-[48%] data-[exiting]:slide-out-to-left-1/2 data-[exiting]:slide-out-to-top-[48%] fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border p-6 shadow-lg duration-200 data-[exiting]:duration-300 sm:rounded-lg md:w-full',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

export interface DialogContentProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Modal>, 'children'>,
  VariantProps<typeof sheetVariants> {
  children?: DialogProps['children']
  role?: DialogProps['role']
  closeButton?: boolean
  dialogClassName?: string
}

function DialogContent({
  className,
  children,
  side,
  role,
  closeButton = true,
  dialogClassName,
  ...props
}: DialogContentProps) {
  return (
    <Modal
      className={values =>
        twMerge(
          !side
          && 'bg-background data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[entering]:slide-in-from-left-1/2 data-[entering]:slide-in-from-top-[48%] data-[exiting]:slide-out-to-left-1/2 data-[exiting]:slide-out-to-top-[48%] fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 border p-6 shadow-lg duration-200 data-[exiting]:duration-300 sm:rounded-lg md:w-full',
          side && sheetVariants({ side }),
          side && 'h-full p-6',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    >
      <Dialog
        role={role}
        className={twMerge(
          'h-full outline-none',
          !side && 'grid h-full gap-4',
          dialogClassName,
        )}
      >
        {values => (
          <>
            {typeof children === 'function' ? children(values) : children}
            {closeButton && (
              <Button
                onPress={values.close}
                className="ring-offset-background focus:ring-ring data-[entering]:bg-accent data-[entering]:text-muted-foreground absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none"
              >
                <Icon icon="lucide:x" className="size-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </>
        )}
      </Dialog>
    </Modal>
  )
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        'flex flex-col space-y-1.5 text-center sm:text-left',
        className,
      )}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className,
      )}
      {...props}
    />
  )
}

function DialogTitle({ className, ...props }: HeadingProps) {
  return (
    <Heading
      slot="title"
      className={twMerge(
        'text-lg font-semibold leading-none tracking-tight',
        className,
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  _DialogOverlay as DialogOverlay,
  DialogTitle,
  _DialogTrigger as DialogTrigger,
}
