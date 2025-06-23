'use client'

import type { ColorPickerProps as ColorPickerPrimitiveProps } from 'react-aria-components'
import type { PopoverContentProps } from './popover'
import { Icon } from '@iconify/react'
import { parseColor } from '@react-stately/color'
import { use } from 'react'
import {
  ColorPicker as ColorPickerPrimitive,
  ColorPickerStateContext,
} from 'react-aria-components'
import { twJoin, twMerge } from 'tailwind-merge'
import { Button } from './button'
import { ColorArea } from './color-area'
import { ColorField } from './color-field'
import { ColorSlider } from './color-slider'
import { ColorSwatch } from './color-swatch'
import { Description } from './field'
import { Popover, PopoverContent } from './popover'

interface ColorPickerProps
  extends ColorPickerPrimitiveProps,
  Pick<PopoverContentProps, 'placement'> {
  label?: string
  className?: string
  children?: React.ReactNode
  showArrow?: boolean
  isDisabled?: boolean
  description?: string
  eyeDropper?: boolean
}

function ColorPicker({
  showArrow = false,
  placement = 'bottom start',
  label,
  isDisabled,
  children,
  description,
  eyeDropper,
  className,
  ...props
}: ColorPickerProps) {
  return (
    <div className={twMerge('flex flex-col items-start gap-y-1.5', className)}>
      <ColorPickerPrimitive {...props}>
        <Popover>
          <Button
            isDisabled={isDisabled}
            size={label ? 'medium' : 'square-petite'}
            intent="plain"
            className={twJoin(
              `
                w-auto px-2.5
                *:data-[slot=color-swatch]:-mx-0.5
              `,
              !label && 'size-10',
            )}
          >
            <ColorSwatch className="size-6" />
            {label && label}
          </Button>
          <PopoverContent
            className={`
              overflow-auto
              **:data-[slot=color-area]:w-full
              **:data-[slot=color-slider]:w-full
              sm:max-w-56 sm:min-w-min sm:**:data-[slot=color-area]:size-56
              sm:*:[[role=dialog]]:p-3
              *:[[role=dialog]]:p-4
            `}
            showArrow={showArrow}
            placement={placement}
          >
            <div className="flex flex-col gap-y-1.5">
              {children || (
                <>
                  <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" />
                  <ColorSlider showOutput={false} colorSpace="hsb" channel="hue" />
                  <div className="flex items-center gap-1.5">
                    {eyeDropper && <EyeDropper />}
                    <ColorField className="h-9" aria-label="Hex" />
                  </div>
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </ColorPickerPrimitive>
      {description && <Description>{description}</Description>}
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
      aria-label="Eye dropper"
      size="square-petite"
      intent="outline"
      onPress={() => {
        const eyeDropper = window.EyeDropper ? new window.EyeDropper() : null
        eyeDropper?.open().then(result => state.setColor(parseColor(result.sRGBHex)))
      }}
    >
      <Icon icon="mdi:eyedropper" className="size-4" />
    </Button>
  )
}

export type { ColorPickerProps }
export { ColorPicker, EyeDropper }
