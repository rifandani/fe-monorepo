'use client'

import { Icon } from '@iconify/react'
import { labelVariants } from '@workspace/ui/components/label'
import {
  Checkbox,
  CheckboxGroup,
  type CheckboxProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const _CheckboxGroup = CheckboxGroup

function _Checkbox({ className, children, ...props }: CheckboxProps) {
  return (
    <Checkbox
      className={values =>
        twMerge(
          'group flex items-center gap-x-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 ',
          labelVariants(),
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    >
      {values => (
        <>
          <div className="border-primary ring-offset-background group-data-[indeterminate]:bg-primary group-data-[selected]:bg-primary group-data-[indeterminate]:text-primary-foreground group-data-[selected]:text-primary-foreground group-data-[focus-visible]:ring-ring size-4 shrink-0  rounded-sm border group-data-[focus-visible]:outline-none group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-offset-2">
            {values.isIndeterminate
              ? (
                  <Icon icon="lucide:minus" className="size-3.5" />
                )
              : values.isSelected
                ? (
                    <Icon icon="lucide:check" className="h-4 w-3.5" />
                  )
                : null}
          </div>
          {typeof children === 'function' ? children(values) : children}
        </>
      )}
    </Checkbox>
  )
}

export { _Checkbox as Checkbox, _CheckboxGroup as CheckboxGroup }
