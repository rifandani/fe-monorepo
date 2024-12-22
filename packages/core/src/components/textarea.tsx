'use client'

import { TextArea, type TextAreaProps } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

function _TextArea({ className, ...props }: TextAreaProps) {
  return (
    <TextArea
      className={values =>
        twMerge(
          'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

export { _TextArea as TextArea }
