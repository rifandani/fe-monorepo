'use client'

import type { ProgressBarProps as ProgressBarPrimitiveProps } from 'react-aria-components'
import { motion } from 'motion/react'
import {
  ProgressBar as ProgressBarPrimitive,

} from 'react-aria-components'

import { Label } from '@/core/components/ui/field'
import { composeTailwindRenderProps } from '@/core/components/ui/primitive'

interface ProgressBarProps extends ProgressBarPrimitiveProps {
  label?: string
  ref?: React.RefObject<HTMLDivElement>
}

function ProgressBar({ label, ref, className, ...props }: ProgressBarProps) {
  return (
    <ProgressBarPrimitive
      ref={ref}
      className={composeTailwindRenderProps(className, 'flex flex-col')}
      {...props}
    >
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <div className="flex justify-between gap-2">
            {label && <Label>{label}</Label>}
            <span className="text-sm text-muted-fg tabular-nums">{valueText}</span>
          </div>
          <div className={`
            relative mt-1 h-2 min-w-64 overflow-hidden rounded-full bg-secondary
            outline-1 -outline-offset-1 outline-transparent
          `}
          >
            {!isIndeterminate
              ? (
                  <motion.div
                    data-slot="progress-content"
                    className={`
                      absolute top-0 left-0 h-full rounded-full bg-primary
                      forced-colors:bg-[Highlight]
                    `}
                    initial={{ width: '0%' }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                )
              : (
                  <motion.div
                    data-slot="progress-content"
                    className={`
                      absolute top-0 h-full rounded-full bg-primary
                      forced-colors:bg-[Highlight]
                    `}
                    initial={{ left: '0%', width: '40%' }}
                    animate={{ left: ['0%', '100%', '0%'] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      ease: 'easeInOut',
                    }}
                  />
                )}
          </div>
        </>
      )}
    </ProgressBarPrimitive>
  )
}

export type { ProgressBarProps }
export { ProgressBar }
