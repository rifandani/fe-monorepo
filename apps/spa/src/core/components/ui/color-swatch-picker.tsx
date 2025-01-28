'use client'

import type { ColorSwatchPickerItemProps, ColorSwatchPickerProps } from 'react-aria-components'
import {
  ColorSwatchPickerItem,
  ColorSwatchPicker as ColorSwatchPickerPrimitive,
} from 'react-aria-components'
import { tv } from 'tailwind-variants'

import { ColorSwatch } from './color-swatch'
import { composeTailwindRenderProps, focusRing } from './primitive'

function ColorSwatchPicker({
  children,
  className,
  layout = 'grid',
  ...props
}: ColorSwatchPickerProps) {
  return (
    <ColorSwatchPickerPrimitive
      layout={layout}
      {...props}
      className={composeTailwindRenderProps(className, 'flex gap-1')}
    >
      {children}
    </ColorSwatchPickerPrimitive>
  )
}

const itemStyles = tv({
  extend: focusRing,
  base: 'relative rounded-lg data-disabled:opacity-50',
})

function SwatchPickerItem(props: ColorSwatchPickerItemProps) {
  return (
    <ColorSwatchPickerItem {...props} className={itemStyles}>
      {({ isSelected }) => (
        <>
          <ColorSwatch />
          {isSelected && (
            <div className="outline-hidden ring-fg/30 absolute left-0 top-0 size-full rounded-[calc(var(--radius-lg)-3.9px)] ring-1 ring-inset forced-color-adjust-none" />
          )}
        </>
      )}
    </ColorSwatchPickerItem>
  )
}

ColorSwatchPicker.Item = SwatchPickerItem

export { ColorSwatchPicker }
