import { Stack } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { KeyboardProvider } from 'react-native-keyboard-controller'
// import * as SplashScreen from 'expo-splash-screen'
import { DevPlugins } from '@/core/providers/dev-plugins'
import { AppI18nProvider } from '@/core/providers/i18n/provider'
import { AppQueryProvider } from '@/core/providers/query/provider'
import { AppTamaguiProvider } from '@/core/providers/tamagui/provider'
import { AppToastProvider } from '@/core/providers/toast/provider'

// // Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync()

// // Set the animation options. This is optional.
// SplashScreen.setOptions({
//   duration: 1000,
//   fade: true,
// })

function App() {
  const { t } = useTranslation()

  return (
    <Stack>
      <Stack.Screen
        name="(authed)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: t('forms.login'),
          headerShown: false,
        }}
      />
    </Stack>
  )
}

export default function RootLayout() {
  return (
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
  )
}
