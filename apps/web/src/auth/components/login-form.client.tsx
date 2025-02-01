'use client'

import { loginStateAction } from '@/auth/actions/auth.action'
import { Button, Note, TextField } from '@/core/components/ui'
import { useTranslations } from 'next-intl'
import { useStateAction } from 'next-safe-action/stateful-hooks'

const initResult = { data: { data: null, error: '' } }

export function LoginForm() {
  const t = useTranslations('auth')
  /**
   * NOTE: there is a bug, if we use `useFormStatus`'s `pending`, it goes:
   * -> `true`, `false`, `true`, `false`
   * where as it should be like below when we used `isPending` from `useStateAction`:
   * -> `true`, `true`, `false`
   */
  const { result, execute, isPending } = useStateAction(loginStateAction, { initResult })

  return (
    <form
      className="flex flex-col pt-3 md:pt-8"
      action={execute}
    >
      <TextField
        name="username"
        className="group/username pt-4"
        validationBehavior="aria"
        label={t('username')}
        placeholder={t('usernamePlaceholder')}
        isRequired
        isPending={isPending}
        errorMessage={result.data?.error ?? undefined}
      />

      <TextField
        name="password"
        className="group/password pt-4"
        validationBehavior="aria"
        label={t('password')}
        placeholder={t('passwordPlaceholder')}
        type="password"
        isRevealable
        isRequired
        isPending={isPending}
        errorMessage={result.data?.error ?? undefined}
      />

      {result.data?.error && (
        <Note intent="danger" className="mt-4">{result.data.error}</Note>
      )}

      <Button
        type="submit"
        className="mt-8 w-full normal-case"
        isPending={isPending}
      >
        {isPending ? t('loginLoading') : t('login')}
        {' '}
        (emilyspass)
      </Button>
    </form>
  )
}
