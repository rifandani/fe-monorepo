'use client'

import { loginAction } from '@/auth/actions/auth'
import { Button, FieldError, Input, Label, Note, TextField } from '@/core/components/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks'
import { authSignInEmailRequestSchema } from '@workspace/core/apis/better-auth'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

export function LoginForm() {
  const t = useTranslations()
  const { action, form, handleSubmitWithAction } = useHookFormAction(loginAction, zodResolver(authSignInEmailRequestSchema), {
    formProps: { mode: 'onChange' },
  })

  return (
    <form
      className={`
        flex flex-col pt-3
        md:pt-8
      `}
      onSubmit={handleSubmitWithAction}
    >
      <Controller
        control={form.control}
        name="email"
        render={({
          field: { name, value, onChange, onBlur },
          fieldState: { error, invalid },
        }) => (
          <TextField
            className="group/username pt-4"
            // let RHF handle validation instead of the browser.
            validationBehavior="aria"
            isRequired
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            isInvalid={invalid}
            isDisabled={action.isPending}
          >
            <Label htmlFor={name}>{t('email')}</Label>
            <Input id={name} aria-label={t('email')} placeholder={t('emailPlaceholder')} type="email" />
            <FieldError>{error?.message}</FieldError>
          </TextField>
        )}
      />

      <Controller
        control={form.control}
        name="password"
        render={({
          field: { name, value, onChange, onBlur },
          fieldState: { error, invalid },
        }) => (
          <TextField
            className="group/password pt-4"
            // Let React Hook Form handle validation instead of the browser.
            validationBehavior="aria"
            type="password"
            isRequired
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            isInvalid={invalid}
            isDisabled={action.isPending}
          >
            <Label htmlFor={name}>{t('password')}</Label>
            <Input id={name} aria-label={t('password')} placeholder={t('passwordPlaceholder')} type="password" />
            <FieldError>{error?.message}</FieldError>
          </TextField>
        )}
      />

      {action.result.data?.error && (
        <Note data-testid="mutation-error" intent="danger" className="mt-4">{action.result.data.error}</Note>
      )}

      <Button
        type="submit"
        className="mt-8 w-full normal-case"
        isDisabled={action.isPending || !form.formState.isValid}
      >
        {action.isPending ? t('loginLoading') : t('login')}
      </Button>
    </form>
  )
}
