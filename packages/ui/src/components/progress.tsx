'use client'

import { ProgressBar, type ProgressBarProps } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

export interface ProgressProps extends ProgressBarProps {
  barClassName?: string
  fillClassName?: string
}

function Progress({
  className,
  barClassName,
  fillClassName,
  children,
  ...props
}: ProgressProps) {
  return (
    <ProgressBar
      className={values =>
        twMerge(
          'w-full',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    >
      {values => (
        <>
          {typeof children === 'function' ? children(values) : children}
          <div
            className={twMerge(
              'bg-secondary relative h-4 w-full overflow-hidden rounded-full',
              barClassName,
            )}
          >
            <div
              className={twMerge(
                'bg-primary size-full flex-1 transition-all',
                fillClassName,
              )}
              style={{
                transform: `translateX(-${100 - (values.percentage || 0)}%)`,
              }}
            />
          </div>
        </>
      )}
    </ProgressBar>
  )
}

export { Progress }
