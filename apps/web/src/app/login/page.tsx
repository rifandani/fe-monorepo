import { LoginForm } from '@/auth/components/login-form.client'
import { Link } from '@/core/components/ui'
import { createMetadata } from '@/core/utils/seo'
import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'

export const metadata = createMetadata({
  title: 'Login',
  description: 'Sign in to your account to access personalized features, manage your profile, and enjoy a seamless experience across our platform.',
})

export default function LoginPage() {
  const t = useTranslations()

  return (
    <div className="flex min-h-screen w-full">
      {/* form */}
      <section className="flex min-h-screen w-full flex-col justify-center px-10 md:w-1/2 xl:px-20">
        <h1 className="text-primary text-center text-3xl">{t('core.welcome')}</h1>

        <LoginForm />

        <p className="py-12 text-center">
          {t('auth.noAccount')}
          {' '}
          <Link
            aria-label={t('auth.registerHere')}
            className="hover:underline"
            href="/"
          >
            {t('auth.registerHere')}
          </Link>
        </p>
      </section>

      {/* image */}
      <section className="hidden w-1/2 shadow-2xl md:block">
        <span className="relative h-screen w-full md:flex md:items-center md:justify-center">
          <Icon
            icon="logos:nextjs-icon"
            className="size-60 object-cover"
            aria-label="cool nextjs logo"
          />
        </span>
      </section>
    </div>
  )
}
