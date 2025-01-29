'use client'

import type { FileTriggerProps as FileTriggerPrimitiveProps } from 'react-aria-components'
import { Icon } from '@iconify/react'
import {
  FileTrigger as FileTriggerPrimitive,
} from 'react-aria-components'
import { Button } from './button'

interface FileTriggerProps extends FileTriggerPrimitiveProps {
  withIcon?: boolean
  isDisabled?: boolean
  intent?: 'primary' | 'secondary' | 'danger' | 'warning'
  size?: 'medium' | 'large' | 'square-petite' | 'extra-small' | 'small'
  shape?: 'square' | 'circle'
  appearance?: 'solid' | 'outline' | 'plain'
  ref?: React.RefObject<HTMLInputElement>
}

function FileTrigger({
  intent = 'primary',
  appearance = 'outline',
  size = 'medium',
  shape = 'square',
  withIcon = true,
  ref,
  ...props
}: FileTriggerProps) {
  return (
    <FileTriggerPrimitive ref={ref} {...props}>
      <Button
        isDisabled={props.isDisabled}
        intent={intent}
        size={size}
        shape={shape}
        appearance={appearance}
      >
        {withIcon
        && (props.defaultCamera
          ? (
              <Icon icon="ion:camera" />
            )
          : props.acceptDirectory
            ? (
                <Icon icon="ion:folder" />
              )
            : (
                <Icon icon="ion:paperclip" />
              ))}
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
