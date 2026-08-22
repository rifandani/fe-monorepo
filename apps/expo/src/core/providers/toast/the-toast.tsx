import Feather from "@expo/vector-icons/Feather";
import { Toast, useToastState } from "@tamagui/toast";
import type { ThemeName } from "tamagui";
import { YStack } from "tamagui";

import type { ToastPreset } from "@/core/utils/toast";
import { resolveToastPreset } from "@/core/utils/toast";

const themeMapper = {
  default: "light",
  error: "red",
  info: "blue",
  success: "green",
  warning: "yellow",
} satisfies Record<ToastPreset, ThemeName>;
const iconMapper = {
  default: null,
  error: <Feather name="alert-circle" size={16} color="white" />,
  info: <Feather name="info" size={16} color="white" />,
  success: <Feather name="check-circle" size={16} color="white" />,
  warning: <Feather name="alert-octagon" size={16} color="white" />,
} satisfies Record<ToastPreset, React.ReactNode>;
export const TheToast = () => {
  const currentToast = useToastState();
  if (!currentToast || currentToast.isHandledNatively) {
    return null;
  }
  const preset = resolveToastPreset(currentToast.customData);
  return (
    <Toast
      theme={themeMapper[preset]}
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
      {iconMapper[preset]}

      <YStack gap="$1">
        <Toast.Title>{currentToast.title}</Toast.Title>
        {!!currentToast.message && (
          <Toast.Description>{currentToast.message}</Toast.Description>
        )}
      </YStack>
    </Toast>
  );
};
