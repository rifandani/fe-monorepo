import type { ColorPickerProps as ColorPickerPrimitiveProps } from 'react-aria-components'
import { EyeDropperIcon } from '@heroicons/react/24/solid'
import { use } from 'react'
import {
  ColorPicker as ColorPickerPrimitive,
  ColorPickerStateContext,
} from 'react-aria-components'
import { parseColor } from 'react-stately'
import { twMerge } from 'tailwind-merge'
import { Button } from './button'
import { fieldStyles } from './field'

interface ColorPickerProps extends ColorPickerPrimitiveProps {
  className?: string
}

function ColorPicker({ className, ...props }: ColorPickerProps) {
  return (
    <div data-slot="control" className={twMerge(fieldStyles({ className: 'w-fit' }), className)}>
      <ColorPickerPrimitive {...props} />
    </div>
  )
}

declare global {
  interface Window {
    EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> }
  }
}

function EyeDropper() {
  const state = use(ColorPickerStateContext)!

  if (!window.EyeDropper) {
    return 'EyeDropper is not supported in your browser.'
  }

  return (
    <Button
      className="shrink-0"
      aria-label="Eye dropper"
      size="sq-md"
      intent="outline"
      onPress={() => {
        const eyeDropper = window.EyeDropper ? new window.EyeDropper() : null
        eyeDropper?.open().then(result => state.setColor(parseColor(result.sRGBHex)))
      }}
    >
      <EyeDropperIcon />
    </Button>
  )
}

export type { ColorPickerProps }
export { ColorPicker, EyeDropper }
