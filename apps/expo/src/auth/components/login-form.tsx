import Feather from '@expo/vector-icons/Feather'
import { zodResolver } from '@hookform/resolvers/zod'
import { authLoginRequestSchema } from '@workspace/core/apis/auth'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Checkbox, Form, Input, Label, Paragraph, Spinner, XStack } from 'tamagui'
import { useAuthLogin } from '@/auth/hooks/use-auth-login'
import { BaseButton } from '@/core/components/button/base-button'
import { useAppStore } from '@/core/hooks/use-app-store'

function RememberMeCheckbox() {
  const { t } = useTranslation()
  const [state, setState] = useState({ rememberMe: false })

  return (
    <XStack my="$2" items="center" gap="$2">
      <Checkbox
        id="rememberMe"
        checked={state.rememberMe}
        onCheckedChange={(checked) => {
          setState(prev => ({ ...prev, rememberMe: !!checked }))
        }}
      >
        <Checkbox.Indicator>
          <Feather name="check" />
        </Checkbox.Indicator>
      </Checkbox>

      <Label htmlFor="rememberMe">{t('forms.rememberMe')}</Label>
    </XStack>
  )
}

export function LoginForm() {
  const { t } = useTranslation()
  const setUser = useAppStore(state => state.setUser)

  const form = useForm({
    mode: 'onChange',
    resolver: zodResolver(authLoginRequestSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const loginMutation = useAuthLogin(undefined, {
    onSuccess: async (user) => {
      setUser(user)
    },
  })

  return (
    <Form
      onSubmit={form.handleSubmit(async (values) => {
        loginMutation.mutate(values)
      })}
    >
      <Label htmlFor="username" mb="$1">
        {t('forms.username')}
      </Label>
      <Controller
        name="username"
        control={form.control}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <Input
              placeholder={t('forms.usernamePlaceholder')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
            {error?.message ? <Paragraph testID="login-form-username-error" color="$red10">{error.message}</Paragraph> : null}
          </>
        )}
      />

      <Label htmlFor="password" my="$2">
        {t('forms.password')}
      </Label>
      <Controller
        name="password"
        control={form.control}
        rules={{
          required: true,
          minLength: 6,
        }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <Input
              secureTextEntry
              placeholder={t('forms.passwordPlaceholder')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
            {error?.message ? <Paragraph testID="login-form-password-error" color="$red10">{error.message}</Paragraph> : null}
          </>
        )}
      />

      <RememberMeCheckbox />

      <Form.Trigger asChild>
        <BaseButton
          icon={
            loginMutation.isPending ? <Spinner size="small" /> : <Feather name="log-in" />
          }
          disabled={loginMutation.isPending || !form.formState.isValid}
        >
          {loginMutation.isPending ? t('forms.loginLoading') : t('forms.login')}
        </BaseButton>
      </Form.Trigger>
    </Form>
  )
}
