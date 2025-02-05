import type { PropsWithChildren } from 'react'
import Constants from 'expo-constants'
import * as SplashScreen from 'expo-splash-screen'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native'

interface SplashVideoProps {
  onLoaded: () => void
  onFinish: () => void
}

/**
 * load video playback asset as splash screen
 */
export function SplashVideo({ onLoaded, onFinish }: SplashVideoProps) {
  const { width } = useWindowDimensions()
  const isTablet = useMemo(() => width >= 768, [width])
  const source = useMemo(
    () =>
      // eslint-disable-next-line ts/no-require-imports
      isTablet ? require('../assets/splash-tablet.mp4') : require('../assets/splash.mp4'),
    [isTablet],
  )

  const player = useVideoPlayer(source, (player) => {
    player.loop = false
    player.play()

    // trigger onLoaded callback
    onLoaded()

    // add event listener for video completion
    player.addListener('playToEnd', onFinish)
  })

  return (
    <VideoView
      style={StyleSheet.absoluteFill}
      player={player}
    />
  )
}

/**
 * wrapper for the imperative animated splash screen video playback
 *
 * @remarks
 *
 * should be placed on root, before any providers
 */
export function SplashScreenWrapper({ children }: PropsWithChildren) {
  const [isAppReady, setIsAppReady] = useState(false)
  const [isSplashVideoComplete, setIsSplashVideoComplete] = useState(false)
  const [isSplashAnimationComplete, setIsSplashAnimationComplete] = useState(false)

  const opacity = useMemo(() => new Animated.Value(1), [])

  const fadeOut = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsSplashAnimationComplete(true)
    })
  }, [opacity])

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync()
    }
    finally {
      setIsAppReady(true)
    }
  }, [])

  const onVideoPlaybackFinish = useCallback(async () => {
    setIsSplashVideoComplete(true)
  }, [])

  useEffect(() => {
    if (isAppReady && isSplashVideoComplete) {
      fadeOut()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAppReady, isSplashVideoComplete])

  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}

      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              opacity,
              backgroundColor: Constants.expoConfig?.splash?.backgroundColor,
            },
          ]}
        >
          <SplashVideo onLoaded={onImageLoaded} onFinish={onVideoPlaybackFinish} />
        </Animated.View>
      )}
    </View>
  )
}
