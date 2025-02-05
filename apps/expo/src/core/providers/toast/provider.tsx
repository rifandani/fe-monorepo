import type { ToastProviderProps } from '@tamagui/toast'
import { SafeToastViewport } from '@/core/providers/toast/safe-toast-viewport'
import { TheToast } from '@/core/providers/toast/the-toast'
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
      native={[
        /*
         * uncomment the next line to do native toasts on mobile
         * only works in dev build and won't work with Expo Go
         */
        'mobile',
      ]}
      {...rest}
    >
      {children}

      <TheToast />
      <SafeToastViewport />
    </ToastProvider>
  )
}
