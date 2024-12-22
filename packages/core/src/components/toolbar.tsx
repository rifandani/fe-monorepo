'use client'

import type {
  ToolbarProps,
} from 'react-aria-components'
import {
  Toolbar as AriaToolbar,
  composeRenderProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

export function Toolbar({ className, ...props }: ToolbarProps) {
  return (
    <AriaToolbar
      className={composeRenderProps(className, className =>
        twMerge(
          'flex gap-2',
          /* Orientation */
          'data-[orientation=vertical]:flex-col',
          className,
        ))}
      {...props}
    />
  )
}
