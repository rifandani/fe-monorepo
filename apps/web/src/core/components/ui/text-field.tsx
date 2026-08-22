'use client'

import {
  TextField as TextFieldPrimitive,
  type TextFieldProps,
} from 'react-aria-components/TextField'
import { cx } from '@/core/utils/primitive'
import { fieldStyles } from './field'

export function TextField({ className, ...props }: TextFieldProps) {
  return (
    <TextFieldPrimitive data-slot="control" className={cx(fieldStyles(), className)} {...props} />
  )
}
