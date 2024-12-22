'use client'

import { Icon } from '@iconify/react'
import { labelVariants } from '@workspace/core/components/label'
import {
  Radio,
  RadioGroup,
  type RadioGroupProps,
  type RadioProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

function _RadioGroup({
  className,
  orientation = 'vertical',
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroup
      className={values =>
        twMerge(
          orientation === 'vertical' && 'grid gap-2',
          orientation === 'horizontal' && 'flex items-center gap-2',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

export interface _RadioProps extends RadioProps {
  showRadio?: boolean
}

function _Radio({
  className,
  children,
  showRadio = true,
  ...props
}: _RadioProps) {
  return (
    <Radio
      className={values =>
        twMerge(
          'group flex items-center gap-x-2 data-[focused]:outline-none',
          labelVariants(),
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    >
      {values => (
        <>
          {showRadio && (
            <span className="border-primary text-primary ring-offset-background group-data-[focus-visible]:ring-ring flex aspect-square size-4 items-center justify-center rounded-full border group-data-[disabled]:opacity-50 group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-offset-2">
              {values.isSelected && (
                <Icon
                  icon="lucide:circle"
                  className="size-2.5 fill-current text-current"
                />
              )}
            </span>
          )}
          {typeof children === 'function' ? children(values) : children}
        </>
      )}
    </Radio>
  )
}

export { _Radio as Radio, _RadioGroup as RadioGroup }
