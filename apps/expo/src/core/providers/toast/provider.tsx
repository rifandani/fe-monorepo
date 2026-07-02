import type { ToastProviderProps } from "@tamagui/toast";
import { ToastProvider } from "@tamagui/toast";

import { SafeToastViewport } from "@/core/providers/toast/safe-toast-viewport";
import { TheToast } from "@/core/providers/toast/the-toast";

const SWIPE_DIRECTION = "horizontal";
// 3s
const DURATION = 3000;
export const AppToastProvider = ({ children, ...rest }: ToastProviderProps) => (
  <ToastProvider
    burntOptions={{ from: "bottom" }}
    duration={DURATION}
    swipeDirection={SWIPE_DIRECTION}
    {...rest}
  >
    {children}

    <TheToast />
    <SafeToastViewport />
  </ToastProvider>
);
