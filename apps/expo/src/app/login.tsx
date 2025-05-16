import { Link } from 'expo-router'
import React from 'react'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { H3, Paragraph, YStack } from 'tamagui'
import { LoginForm } from '@/auth/components/login-form'
import { BaseErrorBoundary } from '@/core/components/base-error-boundary'
import { translate } from '@/core/providers/i18n/translate'

export const ErrorBoundary = BaseErrorBoundary

export default function LoginScreen() {
  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
    >
      <YStack flex={1} px="$3" justify="center">
        <H3 verticalAlign="center">{translate('auth:welcome')}</H3>

        <LoginForm />

        <Paragraph text="center" mt="$2">
          {translate('auth:dontHaveAccount')}
          {' '}
          <Link href="/register" style={{ textDecorationLine: 'underline' }}>
            {translate('auth:registerHere')}
          </Link>
        </Paragraph>
      </YStack>
    </KeyboardAvoidingView>
  )
}
