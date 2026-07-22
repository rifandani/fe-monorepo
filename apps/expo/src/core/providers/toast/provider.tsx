import type { ToastProviderProps } from "@tamagui/toast";
import { ToastProvider } from "@tamagui/toast";

import { SafeToastViewport } from "@/core/providers/toast/safe-toast-viewport";
import { TheToast } from "@/core/providers/toast/the-toast";

const SWIPE_DIRECTION = "horizontal";
const DURATION = 3000; // 3s
export const AppToastProvider = ({ children, ...rest }: ToastProviderProps) => (
  <ToastProvider
    swipeDirection={SWIPE_DIRECTION}
    duration={DURATION}
    burntOptions={{ from: "bottom" }} // only on iOS
    {...rest}
  >
    {children}

    <TheToast />
    <SafeToastViewport />
  </ToastProvider>
);
