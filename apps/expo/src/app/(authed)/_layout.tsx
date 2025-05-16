import { Redirect, Stack, useFocusEffect, usePathname } from 'expo-router'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Paragraph, Spinner, YStack } from 'tamagui'
import { useAppStore } from '@/core/hooks/use-app-store'
import { logger } from '@/core/utils/logger'

/**
 * Side effect to check user authentication status and handle redirects
 *
 * @returns { isAuthenticated, isLoading } - Authentication status and loading state
 *
 * @example
 *
 * ```tsx
 * const { isAuthenticated, isLoading } = useCheckAuth()
 * if (isLoading) return <LoadingSpinner />
 * ```
 */
function useCheckAuth() {
  const pathname = usePathname()
  const user = useAppStore(state => state.user)
  const resetUser = useAppStore(state => state.resetUser)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      try {
        const isLoginRoute = pathname === '/login'

        if (!user && !isLoginRoute) {
          // if user is not authenticated and not on login page
          setIsAuthenticated(false)
        }
        else if (user && isLoginRoute) {
          // If user is authenticated but on login page, reset user (logout)
          // Consider either redirecting to home or resetting user, not both
          resetUser()
          setIsAuthenticated(false)
        }
        else if (user) {
          // User is authenticated and not on login page
          setIsAuthenticated(true)
        }
      }
      catch (error) {
        // Handle navigation errors
        logger.error('[useCheckAuth]: Authentication check failed', error)
        setIsAuthenticated(false)
      }
      finally {
        setIsLoading(false)
      }
    }, [pathname, resetUser, user]),
  )

  return { isAuthenticated, isLoading }
}

export default function AuthedLayout() {
  const { t } = useTranslation()
  const { isAuthenticated, isLoading } = useCheckAuth()

  if (isLoading) {
    return (
      <YStack flex={1} justify="center" items="center" gap="$5">
        <Spinner size="large" color="$primary" />
        <Paragraph>{t('auth.checkingAuth')}</Paragraph>
      </YStack>
    )
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  )
}
