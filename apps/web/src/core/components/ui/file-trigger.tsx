'use client'

import type { VariantProps } from 'tailwind-variants'
import { Icon } from '@iconify/react'
import {
  FileTrigger as FileTriggerPrimitive,
  type FileTriggerProps as FileTriggerPrimitiveProps,
} from 'react-aria-components'
import { Button, type buttonStyles } from '@/core/components/ui/button'
import { Loader } from '@/core/components/ui/loader'

interface FileTriggerProps extends FileTriggerPrimitiveProps, VariantProps<typeof buttonStyles> {
  isDisabled?: boolean
  ref?: React.RefObject<HTMLInputElement>
  className?: string
}

function FileTrigger({
  intent = 'outline',
  size = 'md',
  isCircle = false,
  ref,
  className,
  ...props
}: FileTriggerProps) {
  return (
    <FileTriggerPrimitive ref={ref} {...props}>
      <Button
        className={className}
        isDisabled={props.isDisabled}
        intent={intent}
        size={size}
        isCircle={isCircle}
      >
        {!props.isPending
          ? (
              props.defaultCamera
                ? (
                    <Icon icon="lucide:camera" />
                  )
                : props.acceptDirectory
                  ? (
                      <Icon icon="lucide:folder" />
                    )
                  : (
                      <Icon icon="lucide:paperclip" />
                    )
            )
          : (
              <Loader />
            )}
        {props.children
          ? (
              props.children
            )
          : (
              <>
                {props.allowsMultiple
                  ? 'Browse a files'
                  : props.acceptDirectory
                    ? 'Browse'
                    : 'Browse a file'}
                ...
              </>
            )}
      </Button>
    </FileTriggerPrimitive>
  )
}

export type { FileTriggerProps }
export { FileTrigger }
