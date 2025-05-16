import { Link } from 'expo-router'
import React from 'react'
import { H2, Paragraph, YStack } from 'tamagui'
import { LoginForm } from '@/auth/components/login-form'
import { BaseErrorBoundary } from '@/core/components/base-error-boundary'
import { translate } from '@/core/providers/i18n/translate'

export const ErrorBoundary = BaseErrorBoundary

export default function LoginScreen() {
  return (
    <YStack flex={1} px="$3" justify="center">
      <H2 verticalAlign="center">{translate('auth:welcome')}</H2>

      <LoginForm />

      <Paragraph text="center" mt="$2">
        {translate('auth:dontHaveAccount')}
        {' '}
        <Link href="/register" style={{ textDecorationLine: 'underline' }}>
          {translate('auth:registerHere')}
        </Link>
      </Paragraph>
    </YStack>
  )
}
