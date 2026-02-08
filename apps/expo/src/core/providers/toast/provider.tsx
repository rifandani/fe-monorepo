import { SafeToastViewport } from '@/core/providers/toast/safe-toast-viewport'
import { TheToast } from '@/core/providers/toast/the-toast'
import type { ToastProviderProps } from '@tamagui/toast'
import { ToastProvider } from '@tamagui/toast'

const SWIPE_DIRECTION = 'horizontal'
const DURATION = 3_000 // 3s

/**
 * tamagui toast provider.
 * `TheToast` and `SafeToastViewport` included.
 */
export function AppToastProvider({ children, ...rest }: ToastProviderProps) {
  return (
    <ToastProvider
      swipeDirection={SWIPE_DIRECTION}
      duration={DURATION}
      burntOptions={{ from: 'bottom' }} // only on iOS
      {...rest}
    >
      {children}

      <TheToast />
      <SafeToastViewport />
    </ToastProvider>
  )
}
