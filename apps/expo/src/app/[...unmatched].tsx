import { BaseButton } from '@/core/components/button/base-button'
import { useAppStore } from '@/core/hooks/use-app-store'
import { Link, Stack } from 'expo-router'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { H3, YStack } from 'tamagui'

export default function Unmatched() {
  const { t } = useTranslation()
  const user = useAppStore(state => state.user)

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <YStack flex={1} items="center" justify="center" p={5}>
        <H3 className="text-2xl font-bold">{t('auth.notFound404')}</H3>

        <Link href={user ? '/' : '/login'} replace asChild>
          <BaseButton mt="$3">{t('auth.backTo', { path: user ? 'home' : 'login' })}</BaseButton>
        </Link>
      </YStack>
    </>
  )
}
