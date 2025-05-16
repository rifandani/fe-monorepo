import type { ThemeName } from 'tamagui'
import { Toast, useToastState } from '@tamagui/toast'

export interface ToastCustomData {
  preset: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
}

const themeMapper: Record<ToastCustomData['preset'], ThemeName> = {
  default: 'light',
  primary: 'light_accent',
  secondary: 'dark_accent',
  success: 'green',
  error: 'red',
  warning: 'yellow',
  info: 'blue',
}

export function TheToast() {
  const currentToast = useToastState()

  if (!currentToast || currentToast.isHandledNatively) {
    return null
  }

  return (
    <Toast
      theme={themeMapper[(currentToast.customData as ToastCustomData)?.preset ?? 'default']}
      key={currentToast.id}
      duration={currentToast.duration ?? 3_000}
      viewportName={currentToast.viewportName}
      enterStyle={{ opacity: 0, scale: 0.25, y: 25 }}
      exitStyle={{ opacity: 0, scale: 0.5, y: 25 }}
      opacity={1}
      scale={1}
      y={-15}
      animation="bouncy"
    >
      <Toast.Title>{currentToast.title}</Toast.Title>
      {!!currentToast.message && <Toast.Description>{currentToast.message}</Toast.Description>}
    </Toast>
  )
}
