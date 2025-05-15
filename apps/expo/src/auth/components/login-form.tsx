import Feather from '@expo/vector-icons/Feather'
import { zodResolver } from '@hookform/resolvers/zod'
import { authLoginRequestSchema } from '@workspace/core/apis/auth'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Checkbox, Form, Input, Label, Paragraph, Spinner, XStack } from 'tamagui'
import { useAuthLogin } from '@/auth/hooks/use-auth-login'
import { BaseButton } from '@/core/components/button/base-button'
import { useAppStore } from '@/core/hooks/use-app-store'
import { translate } from '@/core/providers/i18n/translate'

function RememberMeCheckbox() {
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

      <Label htmlFor="rememberMe">{translate('forms:rememberMe')}</Label>
    </XStack>
  )
}

export function LoginForm() {
  const router = useRouter()
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
      router.push('/home')
    },
  })

  return (
    <Form
      mt="$5"
      onSubmit={form.handleSubmit(async (values) => {
        loginMutation.mutate(values)
      })}
    >
      <Label htmlFor="username" mb="$2">
        {translate('forms:username')}
      </Label>
      <Controller
        name="username"
        control={form.control}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <Input
              placeholder={translate('forms:usernamePlaceholder')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
            {error?.message ? <Paragraph color="$red10">{error.message}</Paragraph> : null}
          </>
        )}
      />

      <Label htmlFor="password" my="$2">
        {translate('forms:password')}
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
              placeholder={translate('forms:passwordPlaceholder')}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
            {error?.message ? <Paragraph color="$red10">{error.message}</Paragraph> : null}
          </>
        )}
      />

      <RememberMeCheckbox />

      <Form.Trigger asChild>
        <BaseButton
          icon={
            loginMutation.isPending ? <Spinner size="small" color="$primary" /> : <Feather name="log-in" />
          }
          disabled={loginMutation.isPending || !form.formState.isValid}
        >
          {loginMutation.isPending ? translate('forms:loginLoading') : translate('forms:login')}
          {' '}
          (emilyspass)
        </BaseButton>
      </Form.Trigger>
    </Form>
  )
}
