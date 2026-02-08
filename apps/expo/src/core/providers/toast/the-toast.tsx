import Feather from '@expo/vector-icons/Feather'
import { Toast, useToastState } from '@tamagui/toast'
import type { ThemeName } from 'tamagui'
import { YStack } from 'tamagui'

/**
 * this will affect the toast theme and icon
 */
export interface ToastCustomData {
  preset: 'default' | 'success' | 'error' | 'warning' | 'info'
}

const themeMapper: Record<ToastCustomData['preset'], ThemeName> = {
  default: 'light',
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
}

const iconMapper: Record<ToastCustomData['preset'], React.ReactNode> = {
  default: null,
  success: <Feather name="check-circle" size={16} color="white" />,
  error: <Feather name="alert-circle" size={16} color="white" />,
  warning: <Feather name="alert-octagon" size={16} color="white" />,
  info: <Feather name="info" size={16} color="white" />,
}

export function TheToast() {
  const currentToast = useToastState()

  if (!currentToast || currentToast.isHandledNatively) {
    return null
  }

  const customData = currentToast.customData as ToastCustomData

  return (
    <Toast
      theme={themeMapper[customData?.preset ?? 'default']}
      key={currentToast.id}
      duration={currentToast.duration}
      viewportName={currentToast.viewportName}
      enterStyle={{ opacity: 0, scale: 0.25, y: 25 }}
      exitStyle={{ opacity: 0, scale: 0.5, y: 25 }}
      opacity={1}
      scale={1}
      y={-15}
      animation="bouncy"
      flexDirection="row"
      items="center"
      gap="$2"
    >
      {iconMapper[customData?.preset ?? 'default']}

      <YStack gap="$1">
        <Toast.Title>{currentToast.title}</Toast.Title>
        {!!currentToast.message && <Toast.Description>{currentToast.message}</Toast.Description>}
      </YStack>
    </Toast>
  )
}
