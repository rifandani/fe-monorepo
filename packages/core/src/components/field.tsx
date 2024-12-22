'use client'

import type {
  FieldErrorProps as AriaFieldErrorProps,
  GroupProps as AriaGroupProps,
  LabelProps as AriaLabelProps,
  TextProps as AriaTextProps,
} from 'react-aria-components'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  FieldError as AriaFieldError,
  Group as AriaGroup,
  Label as AriaLabel,
  Text as AriaText,
  composeRenderProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const labelVariants = cva([
  'text-sm font-medium leading-none',
  /* Disabled */
  'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70',
  /* Invalid */
  'group-data-[invalid]:text-destructive',
])

function Label({ className, ...props }: AriaLabelProps) {
  return <AriaLabel className={twMerge(labelVariants(), className)} {...props} />
}

function FormDescription({ className, ...props }: AriaTextProps) {
  return (
    <AriaText
      className={twMerge('text-muted-foreground text-sm', className)}
      {...props}
      slot="description"
    />
  )
}

function FieldError({ className, ...props }: AriaFieldErrorProps) {
  return (
    <AriaFieldError
      className={ctx => twMerge('text-destructive text-sm font-medium', typeof className === 'function' ? className(ctx) : className)}
      {...props}
    />
  )
}

const fieldGroupVariants = cva('', {
  variants: {
    variant: {
      default: [
        'relative flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        /* Focus Within */
        'data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring data-[focus-within]:ring-offset-2',
        /* Disabled */
        'data-[disabled]:opacity-50',
      ],
      ghost: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface GroupProps
  extends AriaGroupProps,
  VariantProps<typeof fieldGroupVariants> {}

function FieldGroup({ className, variant, ...props }: GroupProps) {
  return (
    <AriaGroup
      className={composeRenderProps(className, className =>
        twMerge(fieldGroupVariants({ variant }), className))}
      {...props}
    />
  )
}

export {
  FieldError,
  FieldGroup,
  fieldGroupVariants,
  FormDescription,
  Label,
  labelVariants,
}
