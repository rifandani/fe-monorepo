import { H6, YStack } from 'tamagui'
import { BaseErrorBoundary } from '@/core/components/base-error-boundary'
import { translate } from '@/core/providers/i18n/translate'

export const ErrorBoundary = BaseErrorBoundary

export default function TabsIndexScreen() {
  return (
    <YStack flex={1} p="$3" justify="center">
      <H6>{translate('home:title')}</H6>
    </YStack>
  )
}
