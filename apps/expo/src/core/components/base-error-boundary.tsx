import type { ErrorBoundaryProps } from 'expo-router'
import { BaseButton } from '@/core/components/button/base-button'
import Feather from '@expo/vector-icons/Feather'
import { SafeAreaView } from 'react-native-safe-area-context'
import { H1, Paragraph, YStack } from 'tamagui'

/**
 * to catch expo-router route error
 */
export function BaseErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} justify="center" gap="$5" paddingStart="$5">
        <H1 color="$red10">
          Error:
          {error.name}
        </H1>
        <Paragraph fontStyle="italic">{error.message}</Paragraph>

        <BaseButton icon={<Feather name="repeat" />} onPress={retry}>
          Try Again
        </BaseButton>
      </YStack>
    </SafeAreaView>
  )
}
