'use client'

import type { ColorFieldProps } from 'react-aria-components/ColorField'
import {
  ColorField as ColorFieldPrimitive,

} from 'react-aria-components/ColorField'
import { cx } from '@/core/utils/primitive'
import { fieldStyles } from './field'

export function ColorField({ className, ...props }: ColorFieldProps) {
  return (
    <ColorFieldPrimitive {...props} data-slot="control" className={cx(fieldStyles(), className)} />
  )
}
