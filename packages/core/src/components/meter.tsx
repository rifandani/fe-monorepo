'use client'

import { Meter, type MeterProps } from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

interface _MeterProps extends MeterProps {
  barClassName?: string
  fillClassName?: string
}

function _Meter({
  className,
  barClassName,
  fillClassName,
  children,
  ...props
}: _MeterProps) {
  return (
    <Meter
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
    </Meter>
  )
}

export { _Meter as Meter }
export type { _MeterProps as MeterProps }
