import type { ErrorBoundaryProps } from 'expo-router'
import { BaseButton } from '@/core/components/button/base-button'
import Feather from '@expo/vector-icons/Feather'
import { SafeAreaView } from 'react-native-safe-area-context'

import { H1, Paragraph, YStack } from 'tamagui'

/**
 * to catch expo-router route error
 */
export function BaseErrorBoundary(props: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack f={1} jc="center" gap="$5" p="$5">
        <H1 color="$red10">
          Error:
          {props.error.name}
        </H1>
        <Paragraph fontStyle="italic">{props.error.message}</Paragraph>

        <BaseButton preset="error" icon={<Feather name="repeat" />} onPress={props.retry}>
          Try Again
        </BaseButton>
      </YStack>
    </SafeAreaView>
  )
}
