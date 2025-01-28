import type { AuthLoginRequestSchema } from '@workspace/core/apis/auth.api'
import type { ErrorResponseSchema } from '@workspace/core/apis/core.api'
import { useAuthLogin } from '@/auth/hooks/use-auth-login.hook'
import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store.hook'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { checkAuthUser } from '@/core/utils/checker.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@iconify/react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { authLoginRequestSchema } from '@workspace/core/apis/auth.api'
import reactjs from '@workspace/core/assets/images/reactjs.svg'
import { Button } from '@workspace/core/components/button'
import { Input } from '@workspace/core/components/input'
import { Label } from '@workspace/core/components/label'
import { Link } from '@workspace/core/components/link'
import { FieldError, TextField } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

export const Route = createFileRoute('/login')({
  beforeLoad: ({ location }) => {
    const authed = checkAuthUser()

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
})

function LoginRoute() {
  const [t] = useI18n()

  return (
    <div className="flex min-h-screen w-full">
      {/* form */}
      <section className="flex min-h-screen w-full flex-col justify-center px-10 md:w-1/2 xl:px-20">
        <h1 className="text-primary text-center text-3xl">{t('welcome')}</h1>

        <LoginForm />

        <p className="py-12 text-center">
          {t('noAccount')}
          {' '}
          <Link
            aria-label={t('registerHere')}
            className="hover:underline"
            href="/"
            variant="link"
          >
            {t('registerHere')}
          </Link>
        </p>
      </section>

      {/* image */}
      <section className="hidden w-1/2 shadow-2xl md:block">
        <span className="relative h-screen w-full md:flex md:items-center md:justify-center">
          <img
            src={reactjs}
            alt="cool react logo with rainbow shadow"
            loading="lazy"
            className="h-full object-cover"
            aria-label="cool react logo"
          />
        </span>
      </section>
    </div>
  )
}

function LoginForm() {
  const [t] = useI18n()
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
      setUser(user)
      await navigate({ to: '/' })
    },
  })

  return (
    <form
      className="flex flex-col pt-3 md:pt-8"
      onSubmit={form.handleSubmit(async (values) => {
        loginMutation.mutate(values)
      })}
    >
      <Controller
        name="username"
        control={form.control}
        render={({
          field: { ref, ...field },
          fieldState: { invalid, error },
        }) => (
          <TextField
            className="group/username pt-4"
            // let RHF handle validation instead of the browser.
            validationBehavior="aria"
            {...field}
            isInvalid={invalid}
            isRequired
          >
            <Label>{t('username')}</Label>
            <Input placeholder={t('usernamePlaceholder')} ref={ref} />
            <FieldError className="text-destructive">
              {error?.message}
            </FieldError>
          </TextField>
        )}
      />

      {/* password */}
      <Controller
        control={form.control}
        name="password"
        render={({
          field: { ref, ...field },
          fieldState: { invalid, error },
        }) => (
          <TextField
            className="group/password pt-4"
            // Let React Hook Form handle validation instead of the browser.
            validationBehavior="aria"
            {...field}
            isInvalid={invalid}
            isRequired
          >
            <Label>{t('password')}</Label>
            <Input
              type="password"
              placeholder={t('passwordPlaceholder')}
              ref={ref}
            />
            <FieldError className="text-destructive">
              {error?.message}
            </FieldError>
          </TextField>
        )}
      />

      {loginMutation.error && (
        <div
          data-testid="mutation-error"
          aria-label="Mutation error alert"
          className="bg-destructive text-destructive-foreground mt-2 flex w-full items-center gap-x-2 rounded-md p-2 shadow-md"
        >
          <Icon icon="lucide:alert-circle" />
          <p>{(loginMutation.error as ErrorResponseSchema).message}</p>
        </div>
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
