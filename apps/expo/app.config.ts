import type { ConfigContext, ExpoConfig } from "expo/config";

import { version } from "./package.json";
/**
 * create a new project in EAS, and copy the project ID, slug, and expo account username, and paste here
 */
const EAS_PROJECT_ID = "28f2412b-baec-4843-b0d3-c51706061d29";
const PROJECT_SLUG = "expoapp";
const OWNER = "rifandani";
const getDynamicAppConfig = (
  environment: "development" | "preview" | "production"
) => {
  const APP_NAME = "Expo App";
  const BUNDLE_IDENTIFIER = "com.rifandani.expoapp";
  const BASE_ICON_SRC = "./src/core/assets/icons";
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
export default function expoConfig({ config }: ConfigContext): ExpoConfig {
  console.log(
    `🦌 ~ "app.config.ts" at line 47: process.env.APP_VARIANT ->`,
    process.env.APP_VARIANT
  );
  const { name, bundleIdentifier, icon, adaptiveIcon, scheme } =
    getDynamicAppConfig(
      process.env.APP_VARIANT as "development" | "preview" | "production"
    );
  return {
    ...config,
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
        foregroundImage: adaptiveIcon,
      },
      edgeToEdgeEnabled: true,
      package: bundleIdentifier,
    },
    assetBundlePatterns: ["**/*"],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
      },
      router: {
        origin: false,
      },
    },
    icon,
    ios: {
      bundleIdentifier,
      config: {
        usesNonExemptEncryption: false,
      },
      supportsTablet: true,
    },
    name,
    orientation: "portrait",
    owner: OWNER,
    platforms: ["android", "ios"],
    plugins: [
      "expo-localization",
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#ffffff",
          image: "./src/core/assets/icons/splash.png",
          imageWidth: 200,
          resizeMode: "contain",
        },
      ],
      [
        "expo-font",
        {
          /**
           * <Text style={{ fontFamily: 'SpaceGrotesk_300Light' }}>Space Grotesk 300 Light</Text>
           * <Text style={{ fontFamily: 'SpaceGrotesk_400Regular' }}>Space Grotesk 400 Regular</Text>
           * <Text style={{ fontFamily: 'SpaceGrotesk_500Medium' }}>Space Grotesk 500 Medium</Text>
           * <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold' }}>Space Grotesk 600 Semi Bold</Text>
           * <Text style={{ fontFamily: 'SpaceGrotesk_700Bold' }}>Space Grotesk 700 Bold</Text>
           */
          fonts: [
            "../../node_modules/@expo-google-fonts/space-grotesk/300Light/SpaceGrotesk_300Light.ttf",
            "../../node_modules/@expo-google-fonts/space-grotesk/400Regular/SpaceGrotesk_400Regular.ttf",
            "../../node_modules/@expo-google-fonts/space-grotesk/500Medium/SpaceGrotesk_500Medium.ttf",
            "../../node_modules/@expo-google-fonts/space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf",
            "../../node_modules/@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf",
          ],
        },
      ],
      // [
      //   "react-native-edge-to-edge",
      //   {
      //     "android": {
      //       "parentTheme": "Default",
      //       "enforceNavigationBarContrast": true
      //     }
      //   }
      // ],
    ],
    runtimeVersion: {
      policy: "appVersion",
    },
    scheme,
    slug: PROJECT_SLUG,
    updates: {
      fallbackToCacheTimeout: 0,
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    },
    userInterfaceStyle: "automatic",
    version,
  };
}
