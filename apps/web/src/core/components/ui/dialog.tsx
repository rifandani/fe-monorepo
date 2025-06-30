'use client'

import type { HeadingProps } from 'react-aria-components'
import type { ButtonProps } from '@/core/components/ui/button'
import { Icon } from '@iconify/react'
import { useMediaQuery } from '@workspace/core/hooks/use-media-query'
import { useEffect, useRef } from 'react'
import {
  Button as ButtonPrimitive,
  Dialog as DialogPrimitive,
  Heading,
  Text,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { Button } from '@/core/components/ui/button'
import { composeTailwindRenderProps } from '@/core/components/ui/primitive'

function Dialog({
  role = 'dialog',
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive>) {
  return (
    <DialogPrimitive
      role={role}
      className={twMerge(
        `
          peer/dialog group/dialog relative flex max-h-[inherit] flex-col
          overflow-hidden outline-hidden
          [--gutter:--spacing(6)]
          [scrollbar-width:thin]
          sm:[--gutter:--spacing(8)]
          [&::-webkit-scrollbar]:size-0.5
        `,
        className,
      )}
      {...props}
    />
  )
}

function DialogTrigger(props: React.ComponentProps<typeof ButtonPrimitive>) {
  return <ButtonPrimitive {...props} />
}

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
}

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  const headerRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const header = headerRef.current
    if (!header) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        header.parentElement?.style.setProperty(
          '--dialog-header-height',
          `${entry.target.clientHeight}px`,
        )
      }
    })

    observer.observe(header)
    return () => observer.unobserve(header)
  }, [])

  return (
    <div
      data-slot="dialog-header"
      ref={headerRef}
      className={twMerge(
        'relative space-y-1 p-(--gutter) pb-[calc(var(--gutter)---spacing(3))]',
        className,
      )}
    >
      {props.title && <DialogTitle>{props.title}</DialogTitle>}
      {props.description && <DialogDescription>{props.description}</DialogDescription>}
      {!props.title && typeof props.children === 'string'
        ? (
            <DialogTitle {...props} />
          )
        : (
            props.children
          )}
    </div>
  )
}

interface DialogTitleProps extends Omit<HeadingProps, 'level'> {
  level?: 1 | 2 | 3 | 4
  ref?: React.Ref<HTMLHeadingElement>
}
function DialogTitle({ level = 2, className, ref, ...props }: DialogTitleProps) {
  return (
    <Heading
      slot="title"
      level={level}
      ref={ref}
      className={twMerge(`
        text-lg/6 font-semibold text-balance text-fg
        sm:text-base/6
      `, className)}
      {...props}
    />
  )
}

type DialogDescriptionProps = React.ComponentProps<'div'>
function DialogDescription({ className, ref, ...props }: DialogDescriptionProps) {
  return (
    <Text
      slot="description"
      className={twMerge(
        `
          text-base/6 text-pretty text-muted-fg
          group-disabled:opacity-50
          sm:text-sm/6
        `,
        className,
      )}
      ref={ref}
      {...props}
    />
  )
}

type DialogBodyProps = React.ComponentProps<'div'>
function DialogBody({ className, ref, ...props }: DialogBodyProps) {
  return (
    <div
      data-slot="dialog-body"
      ref={ref}
      className={twMerge(
        `
          isolate flex
          max-h-[calc(var(--visual-viewport-height)-var(--visual-viewport-vertical-padding)-var(--dialog-header-height,0px)-var(--dialog-footer-height,0px))]
          flex-1 flex-col overflow-auto px-(--gutter) py-1
        `,
        className,
      )}
      {...props}
    />
  )
}

type DialogFooterProps = React.ComponentProps<'div'>
function DialogFooter({ className, ...props }: DialogFooterProps) {
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const footer = footerRef.current

    if (!footer) {
      return
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        footer.parentElement?.style.setProperty(
          '--dialog-footer-height',
          `${entry.target.clientHeight}px`,
        )
      }
    })

    observer.observe(footer)
    return () => {
      observer.unobserve(footer)
    }
  }, [])
  return (
    <div
      ref={footerRef}
      data-slot="dialog-footer"
      className={twMerge(
        `
          isolate mt-auto flex flex-col-reverse justify-between gap-3
          p-(--gutter) pt-[calc(var(--gutter)---spacing(2))]
          group-not-has-data-[slot=dialog-body]/dialog:pt-0
          group-not-has-data-[slot=dialog-body]/popover:pt-0
          sm:flex-row
        `,
        className,
      )}
      {...props}
    />
  )
}

function DialogClose({ className, intent = 'outline', ref, ...props }: ButtonProps) {
  return <Button slot="close" className={className} ref={ref} intent={intent} {...props} />
}

interface CloseButtonIndicatorProps extends Omit<ButtonProps, 'children'> {
  className?: string
  isDismissable?: boolean | undefined
}

function DialogCloseIcon({ className, ...props }: CloseButtonIndicatorProps) {
  const isMobile = useMediaQuery('(max-width: 600px)')
  return props.isDismissable
    ? (
        <ButtonPrimitive
          {...(isMobile ? { autoFocus: true } : {})}
          aria-label="Close"
          slot="close"
          className={composeTailwindRenderProps(
            className,
            'close absolute top-1 right-1 z-50 grid size-8 place-content-center rounded-xl hover:bg-secondary focus:bg-secondary focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary sm:top-2 sm:right-2 sm:size-7 sm:rounded-md',
          )}
        >
          <Icon icon="lucide:x" className="size-4" />
        </ButtonPrimitive>
      )
    : null
}

export type {
  CloseButtonIndicatorProps,
  DialogBodyProps,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogTitleProps,
}
export {
  Dialog,
  DialogBody,
  DialogClose,
  DialogCloseIcon,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
