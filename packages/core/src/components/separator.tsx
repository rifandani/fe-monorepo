'use client'

import { Separator, type SeparatorProps } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

function _Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <Separator
      orientation={orientation}
      className={twMerge(
        'bg-border shrink-0',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}

export { _Separator as Separator }
