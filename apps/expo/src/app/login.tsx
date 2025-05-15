import { Link } from 'expo-router'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { H2, Paragraph, styled } from 'tamagui'
import { LoginForm } from '@/auth/components/login-form'
import { translate } from '@/core/providers/i18n/translate'

const SAV = styled(SafeAreaView, {
  name: 'SAV',
  flex: 1,
  px: '$5',
  justify: 'center',
})

export default function LoginScreen() {
  return (
    <SAV>
      <H2 verticalAlign="center">{translate('auth:welcome')}</H2>

      <LoginForm />

      <Paragraph text="center" mt="$2">
        {translate('auth:dontHaveAccount')}
        {' '}
        <Link href="/register" style={{ textDecorationLine: 'underline' }}>
          {translate('auth:registerHere')}
        </Link>
      </Paragraph>
    </SAV>
  )
}
