'use client'

import type { MeterProps as MeterPrimitiveProps } from 'react-aria-components'
import { Icon } from '@iconify/react'
import { motion } from 'motion/react'
import {
  Meter as MeterPrimitive,

} from 'react-aria-components'

import { Label } from './field'
import { composeTailwindRenderProps } from './primitive'

interface MeterProps extends MeterPrimitiveProps {
  label?: string
}

function Meter({ label, ...props }: MeterProps) {
  return (
    <MeterPrimitive
      {...props}
      className={composeTailwindRenderProps(props.className, 'flex flex-col gap-1')}
    >
      {({ percentage, valueText }) => (
        <>
          <div className="flex w-full justify-between gap-2">
            <Label>{label}</Label>
            <span
              className={`text-sm tabular-nums ${percentage >= 80 ? 'text-danger' : 'text-muted-fg'}`}
            >
              {percentage >= 80 && (
                <Icon
                  icon="ion:alert-circle-outline"
                  aria-label="Alert"
                  className="fill-danger/20 text-danger inline-block size-4 align-text-bottom"
                />
              )}
              {` ${valueText}`}
            </span>
          </div>
          <div className="bg-muted relative h-2 min-w-64 rounded-full outline outline-1 -outline-offset-1 outline-transparent">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full forced-colors:bg-[Highlight]"
              initial={{ width: '0%', backgroundColor: getColor(0) }}
              animate={{
                width: `${percentage}%`,
                backgroundColor: getColor(percentage),
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </>
      )}
    </MeterPrimitive>
  )
}

function getColor(percentage: number) {
  if (percentage < 30) {
    return 'var(--primary)'
  }

  if (percentage < 50) {
    return 'var(--success)'
  }

  if (percentage < 70) {
    return '#eab308'
  }

  if (percentage < 80) {
    return 'var(--warning)'
  }

  return 'var(--danger)'
}

export type { MeterProps }
export { Meter }
