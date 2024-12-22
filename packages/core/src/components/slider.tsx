/* eslint-disable react/no-forward-ref */
'use client'

import * as React from 'react'
import {
  Slider,
  SliderOutput,
  type SliderProps,
  SliderStateContext,
  SliderThumb,
  type SliderThumbProps,
  SliderTrack,
  type SliderTrackProps,
} from 'react-aria-components'
import { twMerge } from 'tailwind-merge'

const _SliderOutput = SliderOutput

function _Slider({
  className,
  orientation = 'horizontal',
  ...props
}: SliderProps) {
  return (
    <Slider
      className={values =>
        twMerge(
          'relative flex touch-none select-none items-center',
          orientation === 'vertical' && 'h-full',
          orientation === 'horizontal' && 'w-full',
          typeof className === 'function' ? className(values) : className,
        )}
      orientation={orientation}
      {...props}
    />
  )
}

function _SliderTrack({ className, ...props }: SliderTrackProps) {
  return (
    <SliderTrack
      className={values =>
        twMerge(
          'bg-secondary relative grow rounded-full',
          values.orientation === 'horizontal' && 'h-2 w-full',
          values.orientation === 'vertical' && 'h-full w-2',
          typeof className === 'function' ? className(values) : className,
        )}
      {...props}
    />
  )
}

const _SliderFillTrack = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const state = React.useContext(SliderStateContext)
  const orientation = state?.orientation === 'vertical' ? 'height' : 'width'

  return (
    <div
      ref={ref}
      style={state ? { [orientation]: `${state.getThumbPercent(0) * 100}%` } : undefined}
      className={twMerge(
        'bg-primary absolute rounded-full',
        state?.orientation === 'horizontal' && 'h-full',
        state?.orientation === 'vertical' && 'bottom-0 w-full',
        className,
      )}
      {...props}
    />
  )
})
_SliderFillTrack.displayName = 'SliderFillTrack'

function _SliderThumb({ className }: SliderThumbProps) {
  return (
    <SliderThumb
      className={values =>
        twMerge(
          'border-primary bg-background ring-offset-background focus-visible:ring-ring left-1/2 top-1/2 block size-5 rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          typeof className === 'function' ? className(values) : className,
        )}
    />
  )
}

export {
  _Slider as Slider,
  _SliderFillTrack as SliderFillTrack,
  _SliderOutput as SliderOutput,
  _SliderThumb as SliderThumb,
  _SliderTrack as SliderTrack,
}
