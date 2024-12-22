'use client'

import {
  Tooltip,
  type TooltipProps,
  TooltipTrigger,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const _TooltipTrigger = TooltipTrigger

function _Tooltip({ className, offset = 4, ...props }: TooltipProps) {
  return (
    <Tooltip
      offset={offset}
      className={values =>
        twMerge(
          'bg-popover text-popover-foreground animate-in fade-in-0 data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2 z-50 overflow-hidden rounded-md border px-3 py-1.5 text-sm shadow-md',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

export { _Tooltip as Tooltip, _TooltipTrigger as TooltipTrigger }
