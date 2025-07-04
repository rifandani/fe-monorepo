'use client'

import type {
  RadioGroupProps as RadioGroupPrimitiveProps,
  RadioProps as RadioPrimitiveProps,
} from 'react-aria-components'
import type { FieldProps } from '@/core/components/ui/field'
import {
  composeRenderProps,
  RadioGroup as RadioGroupPrimitive,
  Radio as RadioPrimitive,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { Description, FieldError, Label } from '@/core/components/ui/field'
import { composeTailwindRenderProps } from '@/core/components/ui/primitive'

interface RadioGroupProps extends RadioGroupPrimitiveProps, Omit<FieldProps, 'placeholder'> {}

function RadioGroup({
  className,
  label,
  description,
  errorMessage,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      {...props}
      className={composeTailwindRenderProps(
        className,
        'space-y-3 has-[[slot=description]]:space-y-6 has-[[slot=description]]:**:data-[slot=label]:font-medium **:[[slot=description]]:block',
      )}
    >
      {values => (
        <>
          {label && <Label>{label}</Label>}
          {description && <Description>{description}</Description>}
          {typeof children === 'function' ? children(values) : children}
          <FieldError>{errorMessage}</FieldError>
        </>
      )}
    </RadioGroupPrimitive>
  )
}

interface RadioProps extends RadioPrimitiveProps, Pick<FieldProps, 'label' | 'description'> {}

function Radio({ className, children, description, label, ...props }: RadioProps) {
  return (
    <RadioPrimitive
      {...props}
      className={composeTailwindRenderProps(className, 'group block disabled:opacity-50')}
    >
      {composeRenderProps(children, (children, { isSelected, isFocusVisible, isInvalid }) => {
        const isStringChild = typeof children === 'string'
        const hasCustomChildren = typeof children !== 'undefined'

        const content = hasCustomChildren
          ? (
              isStringChild
                ? (
                    <Label>{children}</Label>
                  )
                : (
                    children
                  )
            )
          : (
              <>
                {label && <Label>{label}</Label>}
                {description && <Description>{description}</Description>}
              </>
            )

        return (
          <div
            className={twMerge(
              `
                grid grid-cols-[1.125rem_1fr] gap-x-3 gap-y-1
                sm:grid-cols-[1rem_1fr]
              `,
              `
                *:data-[slot=indicator]:col-start-1
                *:data-[slot=indicator]:row-start-1
                *:data-[slot=indicator]:mt-0.75
                sm:*:data-[slot=indicator]:mt-1
              `,
              '*:data-[slot=label]:col-start-2 *:data-[slot=label]:row-start-1',
              `
                *:[[slot=description]]:col-start-2
                *:[[slot=description]]:row-start-2
              `,
              'has-[[slot=description]]:**:data-[slot=label]:font-medium',
            )}
          >
            <span
              data-slot="indicator"
              className={twMerge([
                `
                  relative isolate flex size-4.5 shrink-0 items-center
                  justify-center rounded-full bg-secondary text-bg inset-ring
                  inset-ring-fg/10 transition
                  sm:before:size-1.7 sm:size-4
                  before:absolute before:inset-auto before:size-2
                  before:shrink-0 before:rounded-full before:content-['']
                  hover:before:bg-fg/10
                `,
                isSelected && [
                  `
                    bg-primary text-primary-fg
                    before:bg-bg
                    hover:before:bg-muted/90
                    dark:inset-ring-primary
                  `,
                  `
                    group-invalid:bg-danger group-invalid:text-danger-fg
                    group-invalid:inset-ring-danger/70
                  `,
                ],
                isFocusVisible && [
                  'ring-3 ring-ring/20 inset-ring-primary',
                  `
                    group-invalid:text-danger-fg group-invalid:ring-danger/20
                    group-invalid:inset-ring-danger/70
                  `,
                ],
                isInvalid && `
                  bg-danger/20 text-danger-fg ring-danger/20
                  inset-ring-danger/70
                `,
              ])}
            />
            {content}
          </div>
        )
      })}
    </RadioPrimitive>
  )
}

export type { RadioGroupProps, RadioProps }
export { Radio, RadioGroup }
