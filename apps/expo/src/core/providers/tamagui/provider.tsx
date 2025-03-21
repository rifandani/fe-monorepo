import type { TamaguiProviderProps } from 'tamagui'
import { useAppStore } from '@/core/hooks/use-app-store'
import { useReactNavigationDevTools } from '@dev-plugins/react-navigation'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useNavigationContainerRef } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { TamaguiProvider } from 'tamagui'
import config from '../../../../tamagui.config'

/**
 * Tamagui theme provider where we apply the `tamagui.config`.
 */
export function AppTamaguiProvider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>) {
  const scheme = useColorScheme()
  const theme = useAppStore(state => state.theme)
  const value = useMemo(
    () =>
      theme === 'system'
        ? scheme === 'dark'
          ? DarkTheme
          : DefaultTheme
        : theme === 'dark'
          ? DarkTheme
          : DefaultTheme,
    [scheme, theme],
  )

  // integrate with react navigation devtools in development
  const navigationRef = useNavigationContainerRef()
  useReactNavigationDevTools(navigationRef as any)

  return (
    <TamaguiProvider
      disableInjectCSS
      config={config}
      defaultTheme={theme === 'system' ? (scheme as string) : theme}
      {...rest}
    >
      <ThemeProvider value={value}>
        <StatusBar animated style={value.dark ? 'light' : 'dark'} />
        {children}
      </ThemeProvider>
    </TamaguiProvider>
  )
}
