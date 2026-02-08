import { useAuthLogin } from '@/auth/hooks/use-auth-login'
import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store'
import { validateAuthUser } from '@/auth/utils/storage'
import {
  FieldError,
  Input,
  Label,
  Note,
  TextField,
} from '@/core/components/ui'
import { Button } from '@/core/components/ui/button'
import { Link } from '@/core/components/ui/link'
import { useSeo } from '@/core/hooks/use-seo'
import { useTranslation } from '@/core/providers/i18n/context'
import { reportWebVitals } from '@/core/utils/web-vitals'
import { Icon } from '@iconify/react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { authLoginRequestSchema } from '@workspace/core/apis/auth'
import type { ErrorResponseSchema } from '@workspace/core/apis/core'
import { toast } from 'sonner'

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

  const loginMutation = useAuthLogin(undefined, {
    onSuccess: async (user) => {
      // set user to local storage and navigate to home
      setUser(user)
      await navigate({ to: '/' })
    },
  })

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onChange: authLoginRequestSchema,
    },
    onSubmit: ({ value }) => {
      loginMutation.mutate(value)
    },
  })

  return (
    <form
      className={`
        flex flex-col pt-3
        md:pt-8
      `}
      onSubmit={(ev) => {
        ev.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field name="username">
        {field => (
          <TextField
            className="group/username pt-4"
            // let RHF handle validation instead of the browser.
            validationBehavior="aria"
            isRequired
            value={field.state.value}
            onChange={field.handleChange}
            isInvalid={!field.state.meta.isValid}
          >
            <Label htmlFor="username">{t('username')}</Label>
            <Input id="username" aria-label={t('username')} placeholder={t('usernamePlaceholder')} />
            <FieldError>
              {field.state.meta.errorMap.onChange?.[0]?.message}
            </FieldError>
          </TextField>
        )}
      </form.Field>

      {/* password */}
      <form.Field name="password">
        {field => (
          <TextField
            className="group/password pt-4"
            // Let React Hook Form handle validation instead of the browser.
            validationBehavior="aria"
            type="password"
            isRequired
            value={field.state.value}
            onChange={field.handleChange}
            isInvalid={!field.state.meta.isValid}
          >
            <Label htmlFor="password">{t('password')}</Label>
            <Input id="password" aria-label={t('password')} placeholder={t('passwordPlaceholder')} type="password" />
            <FieldError>
              {field.state.meta.errorMap.onChange?.[0]?.message}
            </FieldError>
          </TextField>
        )}
      </form.Field>

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

      <form.Subscribe
        selector={state => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="mt-8"
            isDisabled={!canSubmit || isSubmitting}
          >
            {t(isSubmitting ? 'loginLoading' : 'login')}
            {' '}
            (emilyspass)
          </Button>
        )}
      />
    </form>
  )
}
