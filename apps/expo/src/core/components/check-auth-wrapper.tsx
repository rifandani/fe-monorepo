import type { PropsWithChildren } from 'react'
import { useCheckAuth } from '@/auth/hooks/use-check-auth'
import { BaseSpinner } from '@/core/components/spinner/base-spinner'
import { translate } from '@/core/providers/i18n/translate'
import { Paragraph, YStack } from 'tamagui'

export function CheckAuthWrapper({ children }: PropsWithChildren) {
  const [authed] = useCheckAuth()

  if (!authed) {
    return (
      <YStack flex={1} justify="center" items="center" gap="$5">
        <BaseSpinner size="large" preset="primary" />
        <Paragraph>{translate('auth:checkingAuth')}</Paragraph>
      </YStack>
    )
  }

  return children
}
