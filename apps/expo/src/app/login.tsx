import { LoginForm } from '@/auth/components/login-form'
import { WrapTranslation } from '@/core/components/i18n/wrap-translation'
import { translate } from '@/core/providers/i18n/translate'
import { Link } from 'expo-router'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { H2, Paragraph, styled } from 'tamagui'

const StyledSafeAreaView = styled(SafeAreaView, {
  name: 'SAV',
  flex: 1,
  px: '$5',
  justify: 'center',
})

export default function LoginScreen() {
  return (
    <StyledSafeAreaView>
      <H2 verticalAlign="center">{translate('auth:welcome')}</H2>

      <LoginForm />

      <Paragraph verticalAlign="center" marginEnd="$2">
        <WrapTranslation message={translate('auth:registerHere')}>
          {infix => (
            <Link href="/register">
              {' '}
              {infix}
            </Link>
          )}
        </WrapTranslation>
      </Paragraph>
    </StyledSafeAreaView>
  )
}
