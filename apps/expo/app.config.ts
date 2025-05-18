import type { ConfigContext, ExpoConfig } from 'expo/config'

const isDevelopment = process.env.APP_VARIANT === 'development'
/**
 * so that we can install different app based on the variant without overriding previous installed app
 */
const bundleId = isDevelopment
  ? 'com.rifandani.expoapp.development'
  : 'com.rifandani.expoapp'
const appName = isDevelopment ? 'Expo App (Dev)' : 'Expo App'

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    // copy all existing properties from `app.json` (it should be empty, because we don't have it)
    ...config,
    owner: 'rifandani',
    name: appName,
    slug: 'expoapp',
    scheme: 'expoapp',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic', // to support dark mode
    platforms: ['android', 'ios'],
    assetBundlePatterns: ['**/*'],
    updates: {
      fallbackToCacheTimeout: 0,
    },
    icon: './src/core/assets/icon.png',
    android: {
      package: bundleId,
      // versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './src/core/assets/adaptive-icon.png',
        backgroundColor: '#000',
      },
      edgeToEdgeEnabled: true,
    },
    ios: {
      bundleIdentifier: bundleId,
      // if no remote versions are configured, buildNumber will be initialized based on the value from the local project
      // buildNumber: 1,
      supportsTablet: true,
      // infoPlist: {
      //   ITSAppUsesNonExemptEncryption: false,
      // },
    },
    extra: {
      eas: {
        projectId: '28f2412b-baec-4843-b0d3-c51706061d29',
      },
    },
    experiments: {
      typedRoutes: true,
      // reactCanary: true, // improved errors. link: https://expo.dev/changelog/sdk-53
    },
    plugins: [
      'expo-localization',
      'expo-router',
      // [
      //   "expo-dev-launcher",
      //   {
      //     "launchMode": "most-recent"
      //   }
      // ],
      [
        'expo-splash-screen',
        {
          image: './src/core/assets/splash-icon.png',
          // dark: {
          //   image: './src/core/assets/splash-dark.png',
          //   backgroundColor: '#000000',
          // },
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#25292E',
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            '../../node_modules/@expo-google-fonts/space-grotesk/300Light/SpaceGrotesk_300Light.ttf',
            '../../node_modules/@expo-google-fonts/space-grotesk/400Regular/SpaceGrotesk_400Regular.ttf',
            '../../node_modules/@expo-google-fonts/space-grotesk/500Medium/SpaceGrotesk_500Medium.ttf',
            '../../node_modules/@expo-google-fonts/space-grotesk/600SemiBold/SpaceGrotesk_600SemiBold.ttf',
            '../../node_modules/@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf',
          ],
        },
      ],
    ],
  }
}
