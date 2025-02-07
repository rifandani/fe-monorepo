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
    },
    ios: {
      bundleIdentifier: bundleId,
      // buildNumber: 1,
      supportsTablet: true,
    },
    extra: {
      eas: {
        projectId: '975abfb8-c490-47ad-ab6d-7b7c8c1a063d',
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
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      [
        'expo-font',
        {
          fonts: [
            '../../node_modules/@expo-google-fonts/space-grotesk/SpaceGrotesk_300Light.ttf',
            '../../node_modules/@expo-google-fonts/space-grotesk/SpaceGrotesk_400Regular.ttf',
            '../../node_modules/@expo-google-fonts/space-grotesk/SpaceGrotesk_500Medium.ttf',
            '../../node_modules/@expo-google-fonts/space-grotesk/SpaceGrotesk_600SemiBold.ttf',
            '../../node_modules/@expo-google-fonts/space-grotesk/SpaceGrotesk_700Bold.ttf',
          ],
        },
      ],
    ],
  }
}
