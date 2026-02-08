import { BaseButton } from '@/core/components/button/base-button'
import Feather from '@expo/vector-icons/Feather'
import type { ErrorBoundaryProps } from 'expo-router'
import { H5, Paragraph, YStack } from 'tamagui'

/**
 * to catch expo-router route error
 */
export function BaseErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <YStack flex={1} justify="center" gap="$3" px="$5">
      <H5 color="$red10">
        {error.name}
      </H5>
      <Paragraph fontStyle="italic">{error.message}</Paragraph>

      <BaseButton icon={<Feather name="repeat" />} onPress={retry}>
        Try Again
      </BaseButton>
    </YStack>
  )
}
