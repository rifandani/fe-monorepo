import type { ConfigContext, ExpoConfig } from 'expo/config'
import { version } from './package.json'

/**
 * create a new project in EAS, and copy the project ID, slug, and expo account username, and paste here
 */
const EAS_PROJECT_ID = '28f2412b-baec-4843-b0d3-c51706061d29'
const PROJECT_SLUG = 'expoapp'
const OWNER = 'rifandani'

function getDynamicAppConfig(environment: 'development' | 'preview' | 'production') {
  if (!environment) {
    throw new Error('❌ ENVIRONMENT IS REQUIRED')
  }

  const APP_NAME = 'Expo App'
  const BUNDLE_IDENTIFIER = 'com.rifandani.expoapp'
  const BASE_ICON_SRC = './src/core/assets/icons'
  const SCHEME = 'expoapp'

  if (environment === 'production') {
    return {
      name: APP_NAME,
      bundleIdentifier: BUNDLE_IDENTIFIER,
      icon: `${BASE_ICON_SRC}/ios.png`,
      adaptiveIcon: `${BASE_ICON_SRC}/android.png`,
      scheme: SCHEME,
    }
  }

  if (environment === 'preview') {
    return {
      name: `${APP_NAME} (Preview)`,
      bundleIdentifier: `${BUNDLE_IDENTIFIER}.preview`,
      icon: `${BASE_ICON_SRC}/ios-preview.png`,
      adaptiveIcon: `${BASE_ICON_SRC}/android-preview.png`,
      scheme: `${SCHEME}-preview`,
    }
  }

  return {
    name: `${APP_NAME} (Development)`,
    bundleIdentifier: `${BUNDLE_IDENTIFIER}.development`,
    icon: `${BASE_ICON_SRC}/ios-development.png`,
    adaptiveIcon: `${BASE_ICON_SRC}/android-development.png`,
    scheme: `${SCHEME}-development`,
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const { name, bundleIdentifier, icon, adaptiveIcon, scheme }
    = getDynamicAppConfig((process.env.APP_VARIANT as 'development' | 'preview' | 'production'))

  return {
    // copy all existing properties from `app.json` (it should be empty, because we don't have it)
    ...config,
    owner: OWNER,
    slug: PROJECT_SLUG, // must be consistent across all env
    name,
    scheme,
    version, // automatically bump project version with `npm version patch`, `npm version minor` or `npm version major`.
    orientation: 'portrait',
    userInterfaceStyle: 'automatic', // to support dark mode
    platforms: ['android', 'ios'],
    assetBundlePatterns: ['**/*'],
    updates: {
      fallbackToCacheTimeout: 0,
    },
    runtimeVersion: {
      policy: 'appVersion',
      // url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    },
    icon,
    android: {
      package: bundleIdentifier,
      adaptiveIcon: {
        foregroundImage: adaptiveIcon,
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
    },
    ios: {
      bundleIdentifier,
      supportsTablet: true,
      // infoPlist: {
      //   ITSAppUsesNonExemptEncryption: false,
      // },
    },
    extra: {
      eas: {
        projectId: EAS_PROJECT_ID,
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
          image: './src/core/assets/icons/splash.png',
          // dark: {
          //   image: './src/core/assets/splash-dark.png',
          //   backgroundColor: '#000000',
          // },
          imageWidth: 200,
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
