'use client'

import type { VariantProps } from 'class-variance-authority'
import { buttonVariants } from '@workspace/ui/components/button'
import { Link, type LinkProps } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

interface _LinkProps extends LinkProps, VariantProps<typeof buttonVariants> {}

function _Link({ className, variant, size, ...props }: _LinkProps) {
  return (
    <Link
      className={values =>
        twMerge(
          buttonVariants({
            variant,
            size,
            className:
              typeof className === 'function' ? className(values) : className,
          }),
        )}
      {...props}
    />
  )
}

export { _Link as Link }
export type { _LinkProps as LinkProps }
