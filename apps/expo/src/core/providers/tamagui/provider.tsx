import type { Theme } from "@react-navigation/native";
import { ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { Platform, useColorScheme } from "react-native";
import type { TamaguiProviderProps } from "tamagui";
import { TamaguiProvider, useTheme } from "tamagui";

import { useAppStore } from "@/core/hooks/use-app-store";

import config from "../../../../tamagui.config";

const NavigationThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const tamaguiTheme = useTheme();
  const scheme = useColorScheme();
  const theme = useAppStore((state) => state.theme);
  const defaultTheme = useMemo<Theme>(
    () => ({
      colors: {
        background: tamaguiTheme.background.get(),
        border: tamaguiTheme.accent10.get(),
        card: tamaguiTheme.background.get(),
        notification: tamaguiTheme.blue10.get(),
        primary: tamaguiTheme.blue10.get(),
        text: tamaguiTheme.color.get(),
      },
      dark: false,
      fonts: Platform.select({
        default: {
          bold: {
            fontFamily: "sans-serif",
            fontWeight: "600",
          },
          heavy: {
            fontFamily: "sans-serif",
            fontWeight: "700",
          },
          medium: {
            fontFamily: "sans-serif-medium",
            fontWeight: "normal",
          },
          regular: {
            fontFamily: "sans-serif",
            fontWeight: "normal",
          },
        },
        ios: {
          bold: {
            fontFamily: "System",
            fontWeight: "600",
          },
          heavy: {
            fontFamily: "System",
            fontWeight: "700",
          },
          medium: {
            fontFamily: "System",
            fontWeight: "500",
          },
          regular: {
            fontFamily: "System",
            fontWeight: "400",
          },
        },
      }),
    }),
    [tamaguiTheme]
  );
  const darkTheme = useMemo<Theme>(
    () => ({
      colors: {
        background: tamaguiTheme.background.get(),
        border: tamaguiTheme.accent10.get(),
        card: tamaguiTheme.background.get(),
        notification: tamaguiTheme.blue10.get(),
        primary: tamaguiTheme.blue10.get(),
        text: tamaguiTheme.color.get(),
      },
      dark: true,
      fonts: Platform.select({
        default: {
          bold: {
            fontFamily: "sans-serif",
            fontWeight: "600",
          },
          heavy: {
            fontFamily: "sans-serif",
            fontWeight: "700",
          },
          medium: {
            fontFamily: "sans-serif-medium",
            fontWeight: "normal",
          },
          regular: {
            fontFamily: "sans-serif",
            fontWeight: "normal",
          },
        },
        ios: {
          bold: {
            fontFamily: "System",
            fontWeight: "600",
          },
          heavy: {
            fontFamily: "System",
            fontWeight: "700",
          },
          medium: {
            fontFamily: "System",
            fontWeight: "500",
          },
          regular: {
            fontFamily: "System",
            fontWeight: "400",
          },
        },
      }),
    }),
    [tamaguiTheme]
  );
  const value = useMemo(() => {
    if (theme === "system") {
      return scheme === "dark" ? darkTheme : defaultTheme;
    }
    return theme === "dark" ? darkTheme : defaultTheme;
  }, [scheme, theme, defaultTheme, darkTheme]);
  return (
    <ThemeProvider value={value}>
      <StatusBar animated style={value.dark ? "light" : "dark"} />
      {children}
    </ThemeProvider>
  );
};
export const AppTamaguiProvider = ({
  children,
  ...rest
}: Omit<TamaguiProviderProps, "config">) => {
  const scheme = useColorScheme();
  const theme = useAppStore((state) => state.theme);
  return (
    <TamaguiProvider
      disableInjectCSS
      config={config}
      defaultTheme={theme === "system" ? (scheme as string) : theme}
      {...rest}
    >
      <NavigationThemeProvider>{children}</NavigationThemeProvider>
    </TamaguiProvider>
  );
};
