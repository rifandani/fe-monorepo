import type { ConfigContext, ExpoConfig } from 'expo/config'

/**
 * so that we can install different app based on the variant without overriding previous installed app
 */
const bundleId
  = process.env.APP_VARIANT === 'development'
    ? 'com.rifandani.expoapp.development'
    : 'com.rifandani.expoapp'

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    owner: 'rifandani',
    name: 'expoapp',
    slug: 'expoapp',
    scheme: 'expoapp',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    platforms: ['android', 'ios'],
    newArchEnabled: true,
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
      // buildNumber: 1,
      supportsTablet: true,
    },
    extra: {
      eas: {
        projectId: '28f2412b-baec-4843-b0d3-c51706061d29',
      },
    },
    experiments: {
      typedRoutes: true,
    },
    plugins: [
      'expo-localization',
      'expo-router',
      [
        'expo-video',
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true,
        },
      ],
      [
        'expo-splash-screen',
        {
          image: './src/core/assets/splash.png',
          // dark: {
          //   image: './src/core/assets/splash-dark.png',
          //   backgroundColor: '#000000',
          // },
          // imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
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
