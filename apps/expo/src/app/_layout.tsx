import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useTranslation } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useAppStore } from "@/core/hooks/use-app-store";
import { DevPlugins } from "@/core/providers/dev-plugins";
import { AppI18nProvider } from "@/core/providers/i18n/provider";
import { AppQueryProvider } from "@/core/providers/query/provider";
import { AppTamaguiProvider } from "@/core/providers/tamagui/provider";
import { AppToastProvider } from "@/core/providers/toast/provider";
// // Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync()
// // Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});
const App = () => {
  const { t } = useTranslation();
  const user = useAppStore((state) => state.user);
  return (
    <GestureHandlerRootView>
      <Stack>
        <Stack.Protected guard={!!user}>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack.Protected>

        <Stack.Protected guard={!user}>
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              title: t("forms.login"),
            }}
          />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
};
const RootLayout = () => (
  <KeyboardProvider>
    <AppI18nProvider>
      <AppQueryProvider>
        <AppTamaguiProvider>
          <AppToastProvider>
            <App />
            <DevPlugins />
          </AppToastProvider>
        </AppTamaguiProvider>
      </AppQueryProvider>
    </AppI18nProvider>
  </KeyboardProvider>
);
export default RootLayout;
