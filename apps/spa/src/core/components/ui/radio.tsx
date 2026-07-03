'use client'

import type { RadioButtonProps, RadioFieldProps, RadioGroupProps } from 'react-aria-components/RadioGroup'
import { composeRenderProps } from 'react-aria-components/composeRenderProps'
import {
  RadioButton,

  RadioField as RadioFieldPrimitive,

  RadioGroup as RadioGroupPrimitive,

} from 'react-aria-components/RadioGroup'
import { twMerge } from 'tailwind-merge'
import { Label } from '@/core/components/ui/field'
import { cx } from '@/core/utils/primitive'

export function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      {...props}
      data-slot="control"
      className={cx(
        'space-y-3 has-[[slot=description]]:not-has-[[slot=errorMessage]]:space-y-6 *:data-[slot=label]:font-medium',
        className,
      )}
    />
  )
}

export function RadioField({ className, ...props }: RadioFieldProps) {
  return (
    <RadioFieldPrimitive
      {...props}
      className={cx(
        'grid grid-cols-[1.125rem_1fr] gap-x-3 gap-y-1 sm:grid-cols-[1rem_1fr]',
        '*:data-[slot=control]:col-start-1 *:data-[slot=control]:row-start-1 *:data-[slot=control]:mt-0.75 sm:*:data-[slot=control]:mt-1',
        '**:data-[slot=control-label]:col-start-2 **:data-[slot=control-label]:row-start-1',
        '*:[[slot=description]]:col-start-2 *:[[slot=description]]:row-start-2',
        'has-[[slot=description]]:**:data-[slot=control-label]:font-medium',
        className,
      )}
      data-slot="control"
    />
  )
}

export function Radio({ className, children, ...props }: RadioButtonProps) {
  return (
    <RadioButton
      data-slot="control"
      className={cx('group gap-x-3 inline-flex col-span-full focus:outline-hidden ', className)}
      {...props}
    >
      {composeRenderProps(children, (children, { isSelected, isInvalid }) => {
        return (
          <>
            <span
              data-slot="indicator"
              className={twMerge([
                'sm:before:size-1.7 relative isolate col-start-1 row-start-1 mt-0.75 flex size-4.5 shrink-0 items-center justify-center rounded-full bg-(--control-bg,transparent) text-bg inset-ring inset-ring-input transition before:absolute before:inset-auto before:size-2 before:shrink-0 before:rounded-full before:content-[\'\'] hover:before:bg-muted-fg/20 sm:mt-1 sm:size-4',
                'in-disabled:bg-muted',
                isSelected && [
                  'bg-(--radio-bg,var(--color-primary)) text-(--radio-fg,var(--color-primary-fg)) inset-ring-(--radio-ring,var(--color-ring)) before:bg-bg hover:before:bg-muted/90',
                  'group-invalid:bg-danger group-invalid:text-danger-fg group-invalid:inset-ring-danger-subtle-fg/70',
                ],
                isInvalid
                && 'bg-danger-subtle/5 text-danger-fg ring-danger-subtle-fg/20 inset-ring-danger-subtle-fg/70',
              ])}
            />
            <Label data-slot="control-label" elementType="span">
              {children}
            </Label>
          </>
        )
      })}
    </RadioButton>
  )
}
