import type { ConfigContext, ExpoConfig } from "expo/config";

import { version } from "./package.json";

const EAS_PROJECT_ID = "28f2412b-baec-4843-b0d3-c51706061d29";
const PROJECT_SLUG = "expoapp";
const OWNER = "rifandani";

type AppVariant = "development" | "preview" | "production";

const APP_VARIANTS: readonly AppVariant[] = [
  "development",
  "preview",
  "production",
];

const isAppVariant = (value?: string): value is AppVariant =>
  APP_VARIANTS.some((variant) => variant === value);

const getDynamicAppConfig = (environment?: AppVariant) => {
  const APP_NAME = "Expo App";
  const BUNDLE_IDENTIFIER = "com.rifandani.expoapp";
  const BASE_ICON_SRC = "./src/shared/assets/icons";
  const SCHEME = "expoapp";

  if (environment === "production") {
    return {
      adaptiveIcon: `${BASE_ICON_SRC}/android.png`,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      icon: `${BASE_ICON_SRC}/ios.png`,
      name: APP_NAME,
      scheme: SCHEME,
    };
  }

  if (environment === "preview") {
    return {
      adaptiveIcon: `${BASE_ICON_SRC}/android-preview.png`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      icon: `${BASE_ICON_SRC}/ios-preview.png`,
      name: `${APP_NAME} (Preview)`,
      scheme: `${SCHEME}-preview`,
    };
  }

  return {
    adaptiveIcon: `${BASE_ICON_SRC}/android-development.png`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.development`,
    icon: `${BASE_ICON_SRC}/ios-development.png`,
    name: `${APP_NAME} (Development)`,
    scheme: `${SCHEME}-development`,
  };
};

const PLUGINS = [
  "expo-localization",
  "expo-router",
  [
    "expo-splash-screen",
    {
      image: "./src/shared/assets/icons/splash.png",
      imageWidth: 200,
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
  ],
  [
    "expo-font",
    {
      fonts: [
        "../../node_modules/@expo-google-fonts/space-grotesk/300Light/SpaceGrotesk_300Light.ttf",
        "../../node_modules/@expo-google-fonts/space-grotesk/400Regular/SpaceGrotesk_400Regular.ttf",
        "../../node_modules/@expo-google-fonts/space-grotesk/500Medium/SpaceGrotesk_500Medium.ttf",
        "../../node_modules/@expo-google-fonts/space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf",
        "../../node_modules/@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf",
      ],
    },
  ],
] satisfies ExpoConfig["plugins"];

const STATIC_CONFIG = {
  owner: OWNER,
  slug: PROJECT_SLUG,
  version,
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  platforms: ["android", "ios"],
  updates: {
    fallbackToCacheTimeout: 0,
    url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    eas: {
      projectId: EAS_PROJECT_ID,
    },
    router: {
      origin: false,
    },
  },
  experiments: {
    typedRoutes: true,
  },
  plugins: PLUGINS,
} satisfies Omit<ExpoConfig, "name">;

const appConfig = ({ config }: ConfigContext): ExpoConfig => {
  console.log(
    `🦌 ~ "app.config.ts" at line 47: process.env.APP_VARIANT ->`,
    process.env.APP_VARIANT
  );

  const { name, bundleIdentifier, icon, adaptiveIcon, scheme } =
    getDynamicAppConfig(
      isAppVariant(process.env.APP_VARIANT)
        ? process.env.APP_VARIANT
        : undefined
    );

  return {
    ...config,
    ...STATIC_CONFIG,
    name,
    scheme,
    icon,
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: adaptiveIcon,
      },
      edgeToEdgeEnabled: true,
      package: bundleIdentifier,
    },
    ios: {
      bundleIdentifier,
      supportsTablet: true,
      config: {
        usesNonExemptEncryption: false,
      },
    },
  };
};

export default appConfig;
