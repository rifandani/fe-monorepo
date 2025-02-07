import type { PropsWithChildren } from 'react'
import { useCheckAuth } from '@/auth/hooks/use-check-auth'

import { BaseSpinner } from '@/core/components/spinner/base-spinner'
import { useI18nContext } from '@/core/i18n/i18n-react'
import { Paragraph, YStack } from 'tamagui'

export function CheckAuthWrapper({ children }: PropsWithChildren) {
  const [authed] = useCheckAuth()
  const { LL } = useI18nContext()

  if (!authed) {
    return (
      <YStack f={1} jc="center" ai="center" gap="$5">
        <BaseSpinner size="large" preset="primary" />
        <Paragraph>{LL.auth.checkingAuth()}</Paragraph>
      </YStack>
    )
  }

  return children
}
