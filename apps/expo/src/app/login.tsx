import { Link } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { H3, Paragraph, YStack } from 'tamagui'
import { LoginForm } from '@/auth/components/login-form'
import { BaseErrorBoundary } from '@/core/components/base-error-boundary'

export const ErrorBoundary = BaseErrorBoundary

export default function LoginScreen() {
  const { t } = useTranslation()

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
    >
      <YStack flex={1} px="$3" justify="center">
        <H3 testID="login-welcome-title" verticalAlign="center">{t('auth.welcome')}</H3>

        <LoginForm />

        <Paragraph testID="login-register-text" text="center" mt="$2">
          {t('auth.dontHaveAccount')}
          {' '}
          <Link testID="login-register-text-link" href="/register" style={{ textDecorationLine: 'underline' }}>
            {t('auth.registerHere')}
          </Link>
        </Paragraph>
      </YStack>
    </KeyboardAvoidingView>
  )
}
