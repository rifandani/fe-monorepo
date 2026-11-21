import type { ToastProviderProps } from "@tamagui/toast";
import { ToastProvider } from "@tamagui/toast";

import { SafeToastViewport } from "@/providers/toast/safe-toast-viewport";
import { TheToast } from "@/providers/toast/the-toast";

const SWIPE_DIRECTION = "horizontal";
const DURATION = 3000;

export const AppToastProvider = ({ children, ...rest }: ToastProviderProps) => (
  <ToastProvider
    swipeDirection={SWIPE_DIRECTION}
    duration={DURATION}
    burntOptions={{ from: "bottom" }}
    {...rest}
  >
    {children}

    <TheToast />
    <SafeToastViewport />
  </ToastProvider>
);
