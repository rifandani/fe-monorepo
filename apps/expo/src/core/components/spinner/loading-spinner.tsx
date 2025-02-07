import { BaseSpinner } from '@/core/components/spinner/base-spinner'

import { YStack } from 'tamagui'

export function LoadingSpinner() {
  return (
    <YStack f={1} jc="center" ai="center">
      <BaseSpinner size="large" preset="primary" />
    </YStack>
  )
}
