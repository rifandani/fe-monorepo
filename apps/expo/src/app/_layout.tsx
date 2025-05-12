import { AppI18nProvider } from '@/core/providers/i18n/provider'
import { translate } from '@/core/providers/i18n/translate'
import { AppQueryProvider } from '@/core/providers/query/provider'
import { SplashScreenWrapper } from '@/core/providers/splash-screen-wrapper'
import { AppTamaguiProvider } from '@/core/providers/tamagui/provider'
import { AppToastProvider } from '@/core/providers/toast/provider'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync()

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
})

function App() {
  return (
    <Stack initialRouteName="(tabs)">
      <Stack.Screen
        name="login"
        options={{
          title: translate('forms:login'),
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <SplashScreenWrapper>
      Test

      <AppI18nProvider>
        <AppQueryProvider>
          <AppTamaguiProvider>
            <AppToastProvider>
              <App />
            </AppToastProvider>
          </AppTamaguiProvider>
        </AppQueryProvider>
      </AppI18nProvider>
    </SplashScreenWrapper>
  )
}
