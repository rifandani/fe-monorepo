import type { ErrorResponseSchema } from '@workspace/core/apis/core.api'
import type { Route } from './+types/login.page'
import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store.hook'
import { RouteErrorBoundary } from '@/core/components/route-error-boundary'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { http } from '@/core/services/http.service'
import { checkAuthUser } from '@/core/utils/checker.util'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@iconify/react'
import {
  authLoginRequestSchema,
  type AuthLoginRequestSchema,
  authRepositories,
} from '@workspace/core/apis/auth.api'
import reactjs from '@workspace/core/assets/images/reactjs.svg'
import { Button } from '@workspace/core/components/button'
import { Input } from '@workspace/core/components/input'
import { Label } from '@workspace/core/components/label'
import { Link } from '@workspace/core/components/link'
import { HTTPError } from 'ky'
import { FieldError, TextField } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { redirect, useFetcher } from 'react-router'
import { toast } from 'sonner'
import { ZodError } from 'zod'

export async function clientAction({ request }: Route.ClientActionArgs) {
  if (request.method === 'POST') {
    const formdata = await request.formData()
    const payload = Object.fromEntries(formdata)

    // if `payload` is not correct, return error object
    const parsed = authLoginRequestSchema.safeParse(payload)
    if (!parsed.success)
      return Response.json(parsed.error, { status: 400 })

    try {
      // will throw if `login` returns 4xx/5xx error, therefore `errorElement` will be rendered
      const loginResponse = await authRepositories(http).login({ json: parsed.data })

      useAuthUserStore.getState().setUser(loginResponse) // set user data to store
      return redirect('/')
    }
    catch (error) {
      if (error instanceof HTTPError) {
        const response = (await error.response.json()) as ErrorResponseSchema
        return Response.json(response)
      }
      if (error instanceof ZodError) {
        return Response.json(error)
      }
    }
  }

  toast.warning('Not Implemented')
  return new Response('Not Implemented', { status: 501 })
}

export async function clientLoader() {
  const authed = checkAuthUser()

  // redirect auth user to home
  if (authed) {
    toast.info('Already Logged In')
    return redirect('/')
  }

  return null
}

export const ErrorBoundary = RouteErrorBoundary

export default function Login() {
  const [t] = useI18n()

  return (
    <main className="flex min-h-screen w-full">
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
            href="/does-not-exists"
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
    </main>
  )
}

function LoginForm() {
  const [t] = useI18n()
  const fetcher = useFetcher()
  const { control, formState } = useForm<AuthLoginRequestSchema>({
    mode: 'onChange',
    resolver: zodResolver(authLoginRequestSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  return (
    <fetcher.Form className="flex flex-col pt-3 md:pt-8" method="POST">
      {/* username */}
      <Controller
        control={control}
        name="username"
        render={({
          field: { name, value, onChange, onBlur, ref },
          fieldState: { invalid, error },
        }) => (
          <TextField
            className="group/username pt-4"
            // Let React Hook Form handle validation instead of the browser.
            validationBehavior="aria"
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            isInvalid={invalid}
            isRequired
          >
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
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
        control={control}
        name="password"
        render={({
          field: { name, value, onChange, onBlur, ref },
          fieldState: { invalid, error },
        }) => (
          <TextField
            className="group/password pt-4"
            // Let React Hook Form handle validation instead of the browser.
            validationBehavior="aria"
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            isInvalid={invalid}
            isRequired
          >
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
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

      {fetcher.data && (
        <div
          data-testid="fetcher-error"
          aria-label="Fetcher error alert"
          className="bg-destructive text-destructive-foreground mt-2 flex w-full items-center gap-x-2 rounded-md p-2 shadow-md"
        >
          <Icon icon="lucide:alert-circle" />
          <p>{(fetcher.data as ErrorResponseSchema).message}</p>
        </div>
      )}

      <Button
        type="submit"
        className="mt-8"
        isDisabled={fetcher.state === 'submitting' || !formState.isValid}
      >
        {t(fetcher.state === 'submitting' ? 'loginLoading' : 'login')}
        {' '}
        (emilyspass)
      </Button>
    </fetcher.Form>
  )
}
