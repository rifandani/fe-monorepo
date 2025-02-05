import type { ComponentPropsWithoutRef } from 'react'
import { ToastViewport } from '@tamagui/toast'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props = ComponentPropsWithoutRef<typeof ToastViewport>

export function SafeToastViewport(props: Props) {
  const { left, bottom, right } = useSafeAreaInsets()

  return (
    <ToastViewport
      flexDirection="column"
      bottom={bottom}
      left={left}
      right={right}
      multipleToasts
      {...props}
    />
  )
}
