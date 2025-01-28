'use client'

import { Icon } from '@iconify/react'
import { OTPInput, OTPInputContext } from 'input-otp'
import { use } from 'react'
import { twMerge } from 'tailwind-merge'

type InputOTOPProps = React.ComponentProps<typeof OTPInput>
function InputOTP({
  className,
  autoFocus = true,
  containerClassName,
  ref,
  ...props
}: InputOTOPProps) {
  return (
    <OTPInput
      data-1p-ignore
      ref={ref}
      // eslint-disable-next-line jsx-a11y/no-autofocus
      autoFocus={autoFocus}
      containerClassName={twMerge('has-disabled:opacity-50 flex items-center gap-2', containerClassName)}
      className={twMerge('mt-auto h-10 bg-red-500 disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

type InputOTPGroupProps = React.ComponentProps<'div'>
function InputOTPGroup({ className, ref, ...props }: InputOTPGroupProps) {
  return <div ref={ref} className={twMerge('flex items-center gap-x-1.5', className)} {...props} />
}

interface InputOTPSlotProps extends React.ComponentProps<'div'> {
  index: number
}

function InputOTPSlot({ index, className, ref, ...props }: InputOTPSlotProps) {
  const inputOTPContext = use(OTPInputContext)
  const slot = inputOTPContext.slots[index]

  if (!slot) {
    throw new Error('Slot not found')
  }

  const { char, hasFakeCaret, isActive } = slot

  return (
    <div
      ref={ref}
      className={twMerge(
        'border-input relative flex size-10 items-center justify-center rounded-md border text-sm tabular-nums transition-all',
        isActive && 'border-ring/70 ring-ring/20 z-10 ring-4',
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-fg h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  )
}

type InputOTPSeparatorProps = React.ComponentProps<'div'>
function InputOTPSeparator({ ref, ...props }: InputOTPSeparatorProps) {
  return (
    <div ref={ref} {...props}>
      <Icon icon="ion:ios-circle-filled" className="size-2" />
    </div>
  )
}

InputOTP.Group = InputOTPGroup
InputOTP.Slot = InputOTPSlot
InputOTP.Separator = InputOTPSeparator

export type { InputOTOPProps, InputOTPGroupProps, InputOTPSeparatorProps, InputOTPSlotProps }
export { InputOTP }
