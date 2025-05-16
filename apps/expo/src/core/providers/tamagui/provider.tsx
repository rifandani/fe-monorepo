import type { Theme } from '@react-navigation/native'
import type { TamaguiProviderProps } from 'tamagui'
import { ThemeProvider } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import { useMemo } from 'react'
import { Platform, useColorScheme } from 'react-native'
import { TamaguiProvider, useTheme } from 'tamagui'
import { useAppStore } from '@/core/hooks/use-app-store'
import config from '../../../../tamagui.config'

function NavigationThemeProvider({ children }: { children: React.ReactNode }) {
  const tamaguiTheme = useTheme()
  const scheme = useColorScheme()
  const theme = useAppStore(state => state.theme)

  const defaultTheme = useMemo<Theme>(() => ({
    dark: false,
    colors: {
      primary: tamaguiTheme.blue10.get(),
      background: tamaguiTheme.background.get(),
      card: tamaguiTheme.background.get(),
      text: tamaguiTheme.color.get(),
      border: tamaguiTheme.accent10.get(),
      notification: tamaguiTheme.blue10.get(),
    },
    fonts: Platform.select({
      ios: {
        regular: {
          fontFamily: 'System',
          fontWeight: '400',
        },
        medium: {
          fontFamily: 'System',
          fontWeight: '500',
        },
        bold: {
          fontFamily: 'System',
          fontWeight: '600',
        },
        heavy: {
          fontFamily: 'System',
          fontWeight: '700',
        },
      },
      default: {
        regular: {
          fontFamily: 'sans-serif',
          fontWeight: 'normal',
        },
        medium: {
          fontFamily: 'sans-serif-medium',
          fontWeight: 'normal',
        },
        bold: {
          fontFamily: 'sans-serif',
          fontWeight: '600',
        },
        heavy: {
          fontFamily: 'sans-serif',
          fontWeight: '700',
        },
      },
    }),
  }), [tamaguiTheme])

  const darkTheme = useMemo<Theme>(() => ({
    dark: true,
    colors: {
      primary: tamaguiTheme.blue10.get(),
      background: tamaguiTheme.background.get(),
      card: tamaguiTheme.background.get(),
      text: tamaguiTheme.color.get(),
      border: tamaguiTheme.accent10.get(),
      notification: tamaguiTheme.blue10.get(),
    },
    fonts: Platform.select({
      ios: {
        regular: {
          fontFamily: 'System',
          fontWeight: '400',
        },
        medium: {
          fontFamily: 'System',
          fontWeight: '500',
        },
        bold: {
          fontFamily: 'System',
          fontWeight: '600',
        },
        heavy: {
          fontFamily: 'System',
          fontWeight: '700',
        },
      },
      default: {
        regular: {
          fontFamily: 'sans-serif',
          fontWeight: 'normal',
        },
        medium: {
          fontFamily: 'sans-serif-medium',
          fontWeight: 'normal',
        },
        bold: {
          fontFamily: 'sans-serif',
          fontWeight: '600',
        },
        heavy: {
          fontFamily: 'sans-serif',
          fontWeight: '700',
        },
      },
    }),
  }), [tamaguiTheme])

  const value = useMemo(
    () =>
      theme === 'system'
        ? scheme === 'dark'
          ? darkTheme
          : defaultTheme
        : theme === 'dark'
          ? darkTheme
          : defaultTheme,
    [scheme, theme, defaultTheme, darkTheme],
  )

  return (
    <ThemeProvider value={value}>
      <StatusBar animated style={value.dark ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  )
}

/**
 * Tamagui theme provider where we apply the `tamagui.config`.
 */
export function AppTamaguiProvider({ children, ...rest }: Omit<TamaguiProviderProps, 'config'>) {
  const scheme = useColorScheme()
  const theme = useAppStore(state => state.theme)

  return (
    <TamaguiProvider
      disableInjectCSS
      config={config}
      defaultTheme={theme === 'system' ? (scheme as string) : theme}
      {...rest}
    >
      <NavigationThemeProvider>
        {children}
      </NavigationThemeProvider>
    </TamaguiProvider>
  )
}
