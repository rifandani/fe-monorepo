import { BaseButton } from '@/core/components/button/base-button'
import { useAppStore } from '@/core/hooks/use-app-store'
import { translate } from '@/core/providers/i18n/translate'
import { Link, Stack } from 'expo-router'
import React from 'react'
import { H1, YStack } from 'tamagui'

export default function Unmatched() {
  const user = useAppStore(state => state.user)

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />

      <YStack flex={1} items="center" justify="center" p={5}>
        <H1 className="text-2xl font-bold">{translate('auth:notFound404')}</H1>

        <Link href={user ? '/home' : '/login'} replace asChild>
          <BaseButton mt="$2">{translate('auth:backTo', { isLoggedIn: user ? 'true' : 'false' })}</BaseButton>
        </Link>
      </YStack>
    </>
  )
}
