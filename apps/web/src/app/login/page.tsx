import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { LoginForm } from '@/auth/components/login-form.client'
import { Link } from '@/core/components/ui'
import { createMetadata, createWebPage, createWebSite, JsonLd } from '@/core/utils/seo'

const title = 'Login'
const description = 'Sign in to your account to access personalized features, manage your profile, and enjoy a seamless experience across our platform.'
const ldParams = {
  url: process.env.NODE_ENV === 'production' ? 'https://rifandani.com/login' : 'http://localhost:3002/login',
  title,
  description,
}

export const metadata = createMetadata({
  title,
  description,
})

export default function LoginPage() {
  const t = useTranslations()

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
            href="/register"
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
            icon="logos:nextjs-icon"
            className="size-60 object-cover"
            aria-label="cool nextjs logo"
          />
        </span>
      </section>

      <JsonLd graphs={[
        createWebSite(ldParams),
        createWebPage(ldParams),
      ]}
      />
    </div>
  )
}
