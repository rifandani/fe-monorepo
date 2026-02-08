'use client'

import { fieldStyles } from './field'
import { cx } from '@/core/utils/primitive'
import type { ColorFieldProps } from 'react-aria-components'
import { ColorField as ColorFieldPrimitive } from 'react-aria-components'

export function ColorField({ className, ...props }: ColorFieldProps) {
  return (
    <ColorFieldPrimitive
      {...props}
      aria-label={props['aria-label'] ?? 'Color field'}
      data-slot="control"
      className={cx(fieldStyles(), className)}
    />
  )
}
