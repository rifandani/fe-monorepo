import type { Theme } from "@react-navigation/native";
import { ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Platform, useColorScheme } from "react-native";
import type { TamaguiProviderProps } from "tamagui";
import { TamaguiProvider, useTheme } from "tamagui";
import { match } from "ts-pattern";

import { useAppStore } from "@/core/hooks/use-app-store";

import config from "../../../../tamagui.config";

const NAV_FONTS = Platform.select({
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
}) satisfies Theme["fonts"];

/** Maps the active tamagui theme onto a react-navigation theme. */
const buildNavigationTheme = (
  tamaguiTheme: ReturnType<typeof useTheme>,
  dark: boolean
): Theme => ({
  colors: {
    background: tamaguiTheme.background.get(),
    border: tamaguiTheme.accent10.get(),
    card: tamaguiTheme.background.get(),
    notification: tamaguiTheme.blue10.get(),
    primary: tamaguiTheme.blue10.get(),
    text: tamaguiTheme.color.get(),
  },
  dark,
  fonts: NAV_FONTS,
});

const NavigationThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const tamaguiTheme = useTheme();
  const scheme = useColorScheme();
  const theme = useAppStore((state) => state.theme);
  const isDark = match(theme)
    .with("system", () => scheme === "dark")
    .with("dark", () => true)
    .otherwise(() => false);
  const value = buildNavigationTheme(tamaguiTheme, isDark);
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
      defaultTheme={match(theme)
        .with(
          "system",
          () =>
            // SAFETY: `useColorScheme` resolves to "light" or "dark" here; its type
            // keeps the null the RN API allows before the first read.
            scheme as string
        )
        .otherwise((t) => t)}
      {...rest}
    >
      <NavigationThemeProvider>{children}</NavigationThemeProvider>
    </TamaguiProvider>
  );
};
