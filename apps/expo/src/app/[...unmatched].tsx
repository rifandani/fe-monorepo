import { Link, Stack } from 'expo-router'
import React from 'react'
import { H3, YStack } from 'tamagui'
import { BaseButton } from '@/core/components/button/base-button'
import { useAppStore } from '@/core/hooks/use-app-store'
import { translate } from '@/core/providers/i18n/translate'

export default function Unmatched() {
  const user = useAppStore(state => state.user)

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <YStack flex={1} items="center" justify="center" p={5}>
        <H3 className="text-2xl font-bold">{translate('auth:notFound404')}</H3>

        <Link href={user ? '/' : '/login'} replace asChild>
          <BaseButton mt="$3">{translate('auth:backTo', { path: user ? 'home' : 'login' })}</BaseButton>
        </Link>
      </YStack>
    </>
  )
}
