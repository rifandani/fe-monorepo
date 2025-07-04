import type { AuthLoginRequestSchema } from '@workspace/core/apis/auth'
import type { ErrorResponseSchema } from '@workspace/core/apis/core'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@iconify/react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { authLoginRequestSchema } from '@workspace/core/apis/auth'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useAuthLogin } from '@/auth/hooks/use-auth-login'
import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store'
import { validateAuthUser } from '@/auth/utils/storage'
import { Note, TextField } from '@/core/components/ui'
import { Button } from '@/core/components/ui/button'
import { Link } from '@/core/components/ui/link'
import { useSeo } from '@/core/hooks/use-seo'
import { useTranslation } from '@/core/providers/i18n/context'
import { reportWebVitals } from '@/core/utils/web-vitals'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ location }) => {
    const authed = validateAuthUser()

    if (authed) {
      // redirect authorized user to login
      toast.info('Already Logged In')
      throw redirect({
        to: '/',
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can potentially lag behind the actual current location)
          redirect: location.href,
        },
      })
    }
  },
  component: LoginRoute,
  onEnter() {
    reportWebVitals()
  },
})

function LoginRoute() {
  useSeo({
    title: 'Login',
    description: 'Sign in to your account to access personalized features, manage your profile, and enjoy a seamless experience across our platform.',
  })
  const { t } = useTranslation()

  return (
    <div className="flex min-h-screen w-full">
      {/* form */}
      <section className={`
        flex min-h-screen w-full flex-col justify-center px-10
        md:w-1/2
        xl:px-20
      `}
      >
        <h1 className="text-center text-3xl text-primary">{t('welcome')}</h1>

        <LoginForm />

        <p className="py-12 text-center">
          {t('noAccount')}
          {' '}
          <Link
            aria-label={t('registerHere')}
            className="hover:underline"
            href="/"
          >
            {t('registerHere')}
          </Link>
        </p>
      </section>

      {/* image */}
      <section className={`
        hidden w-1/2 shadow-2xl
        md:block
      `}
      >
        <span className={`
          relative h-screen w-full
          md:flex md:items-center md:justify-center
        `}
        >
          <Icon
            icon="logos:react"
            className="size-60 object-cover"
            aria-label="cool react logo"
          />
        </span>
      </section>
    </div>
  )
}

function LoginForm() {
  const { t } = useTranslation()
  const navigate = Route.useNavigate()
  const { setUser } = useAuthUserStore()

  const form = useForm<AuthLoginRequestSchema>({
    mode: 'onChange',
    resolver: zodResolver(authLoginRequestSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const loginMutation = useAuthLogin(undefined, {
    onSuccess: async (user) => {
      // set user to local storage and navigate to home
      setUser(user)
      await navigate({ to: '/' })
    },
  })

  return (
    <form
      className={`
        flex flex-col pt-3
        md:pt-8
      `}
      onSubmit={form.handleSubmit(async (values) => {
        loginMutation.mutate(values)
      })}
    >
      <Controller
        name="username"
        control={form.control}
        render={({
          field: { disabled, ...field },
          fieldState: { invalid, error },
        }) => (
          <TextField
            className="group/username pt-4"
            // let RHF handle validation instead of the browser.
            validationBehavior="aria"
            label={t('username')}
            placeholder={t('usernamePlaceholder')}
            {...field}
            isRequired
            isInvalid={invalid}
            isDisabled={disabled}
            errorMessage={error?.message}
          >
            {/* <Input ref={ref} /> */}
          </TextField>
        )}
      />

      {/* password */}
      <Controller
        control={form.control}
        name="password"
        render={({
          field: { disabled, ...field },
          fieldState: { invalid, error },
        }) => (
          <TextField
            className="group/password pt-4"
            // Let React Hook Form handle validation instead of the browser.
            validationBehavior="aria"
            label={t('password')}
            placeholder={t('passwordPlaceholder')}
            type="password"
            {...field}
            isRevealable
            isRequired
            isInvalid={invalid}
            isDisabled={disabled}
            errorMessage={error?.message}
          >
            {/* <Input ref={ref} /> */}
          </TextField>
        )}
      />

      {loginMutation.error && (
        <Note
          data-testid="mutation-error"
          aria-label="Mutation error alert"
          intent="danger"
          className="mt-4"
        >
          {(loginMutation.error as ErrorResponseSchema).message}
        </Note>
      )}

      <Button
        type="submit"
        className="mt-8"
        isDisabled={loginMutation.isPending || !form.formState.isValid}
      >
        {t(loginMutation.isPending ? 'loginLoading' : 'login')}
        {' '}
        (emilyspass)
      </Button>
    </form>
  )
}
