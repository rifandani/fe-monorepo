'use client'

import type {
  CheckboxGroupProps as CheckboxGroupPrimitiveProps,
  CheckboxProps as CheckboxPrimitiveProps,
} from 'react-aria-components'
import type { FieldProps } from '@/core/components/ui/field'
import { Icon } from '@iconify/react'
import {
  CheckboxGroup as CheckboxGroupPrimitive,
  Checkbox as CheckboxPrimitive,
  composeRenderProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'
import { Description, FieldError, Label } from '@/core/components/ui/field'
import { composeTailwindRenderProps } from '@/core/components/ui/primitive'

interface CheckboxGroupProps extends CheckboxGroupPrimitiveProps, Omit<FieldProps, 'placeholder'> {}

function CheckboxGroup({ className, children, ...props }: CheckboxGroupProps) {
  return (
    <CheckboxGroupPrimitive
      {...props}
      className={composeTailwindRenderProps(
        className,
        'space-y-3 has-[[slot=description]]:space-y-6 has-[[slot=description]]:**:data-[slot=label]:font-medium **:[[slot=description]]:block',
      )}
    >
      {values => (
        <>
          {props.label && <Label>{props.label}</Label>}
          {props.description && <Description>{props.description}</Description>}
          {typeof children === 'function' ? children(values) : children}
          <FieldError>{props.errorMessage}</FieldError>
        </>
      )}
    </CheckboxGroupPrimitive>
  )
}

interface CheckboxProps extends CheckboxPrimitiveProps, Pick<FieldProps, 'label' | 'description'> {}

function Checkbox({ className, children, description, label, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive
      {...props}
      className={composeTailwindRenderProps(className, 'group block disabled:opacity-50')}
    >
      {composeRenderProps(
        children,
        (children, { isSelected, isIndeterminate, isFocusVisible, isInvalid }) => {
          const isStringChild = typeof children === 'string'
          const hasCustomChildren = typeof children !== 'undefined'

          const indicator = isIndeterminate
            ? (
                <Icon icon="lucide:minus" data-slot="check-indicator" />
              )
            : isSelected
              ? (
                  <Icon icon="lucide:check" data-slot="check-indicator" />
                )
              : null

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
                `
                  *:data-[slot=label]:col-start-2
                  *:data-[slot=label]:row-start-1
                `,
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
                    relative isolate flex shrink-0 items-center justify-center
                    rounded bg-muted text-bg inset-ring inset-ring-fg/10
                    transition
                  `,
                  'sm:size-4 sm:*:data-[slot=check-indicator]:size-3.5',
                  `
                    size-4.5
                    *:data-[slot=check-indicator]:size-4
                  `,
                  (isSelected || isIndeterminate) && [
                    `
                      bg-primary text-primary-fg
                      dark:inset-ring-primary
                    `,
                    `
                      group-invalid:bg-danger group-invalid:text-danger-fg
                      group-invalid:inset-ring-danger/70
                      dark:group-invalid:inset-ring-danger/70
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
              >
                {indicator}
              </span>
              {content}
            </div>
          )
        },
      )}
    </CheckboxPrimitive>
  )
}

export type { CheckboxGroupProps, CheckboxProps }
export { Checkbox, CheckboxGroup }
