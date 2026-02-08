'use client'
import { fieldStyles } from './field'
import { cx } from '@/core/utils/primitive'
import type { TextFieldProps } from 'react-aria-components'
import { TextField as TextFieldPrimitive } from 'react-aria-components'

export function TextField({ className, ...props }: TextFieldProps) {
  return (
    <TextFieldPrimitive data-slot="control" className={cx(fieldStyles(), className)} {...props} />
  )
}
