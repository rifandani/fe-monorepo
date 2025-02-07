import { BaseSpinner } from '@/core/components/spinner/base-spinner'
import { YStack } from 'tamagui'

export function LoadingSpinner() {
  return (
    <YStack flex={1} justify="center" items="center">
      <BaseSpinner size="large" preset="primary" />
    </YStack>
  )
}
