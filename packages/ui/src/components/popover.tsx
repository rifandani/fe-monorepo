'use client'

import {
  DialogTrigger,
  Popover,
  type PopoverProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const PopoverTrigger = DialogTrigger

function _Popover({ className, offset = 4, ...props }: PopoverProps) {
  return (
    <Popover
      offset={offset}
      className={values =>
        twMerge(
          'bg-popover text-popover-foreground data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 w-72 overflow-y-auto rounded-md border p-4 shadow-md outline-none',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

export { _Popover as Popover, PopoverTrigger }
