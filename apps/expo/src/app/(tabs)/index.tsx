import { BaseErrorBoundary } from '@/core/components/base-error-boundary'
import { useTranslation } from 'react-i18next'
import { H6, YStack } from 'tamagui'

export const ErrorBoundary = BaseErrorBoundary

export default function TabsIndexScreen() {
  const { t } = useTranslation()

  return (
    <YStack flex={1} p="$3" justify="center">
      <H6>{t('home.title')}</H6>
    </YStack>
  )
}
