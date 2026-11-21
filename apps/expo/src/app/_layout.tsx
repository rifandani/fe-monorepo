import { useAtomValue } from "@effect/atom-react";
import { PersistenceProvider } from "@workspace/core/persistence/provider";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { persistence } from "@/lib/layers/persistence";
import { DevPlugins } from "@/providers/dev-plugins";
import { TranslationProvider, useTranslation } from "@/providers/i18n/context";
import { AppQueryProvider } from "@/providers/query/provider";
import { AppTamaguiProvider } from "@/providers/tamagui/provider";
import { AppToastProvider } from "@/providers/toast/provider";

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const App = () => {
  const { t } = useTranslation();
  const user = useAtomValue(persistence.sessionAtom);

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
              title: t("login"),
            }}
          />
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
};

const RootLayout = () => (
  <KeyboardProvider>
    <PersistenceProvider persistence={persistence}>
      <TranslationProvider>
        <AppQueryProvider>
          <AppTamaguiProvider>
            <AppToastProvider>
              <App />
              <DevPlugins />
            </AppToastProvider>
          </AppTamaguiProvider>
        </AppQueryProvider>
      </TranslationProvider>
    </PersistenceProvider>
  </KeyboardProvider>
);

export default RootLayout;
