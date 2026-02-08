import { fieldStyles } from './field'
import { DateInput } from '@/core/components/ui/date-field'
import { cx } from '@/core/utils/primitive'
import type { TimeFieldProps, TimeValue } from 'react-aria-components'
import {
  TimeField as TimeFieldPrimitive,

} from 'react-aria-components'

export function TimeField<T extends TimeValue>({ className, ...props }: TimeFieldProps<T>) {
  return (
    <TimeFieldPrimitive
      {...props}
      data-slot="control"
      className={cx(fieldStyles({ className: 'w-fit' }), className)}
    />
  )
}

export const TimeInput = DateInput
