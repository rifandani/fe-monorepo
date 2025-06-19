import { useStringFlagValue } from '@openfeature/react-sdk'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'
import { validateAuthUser } from '@/auth/utils/storage'
import { LanguageToggle } from '@/core/components/language-toggle'
import { ProfileMenu } from '@/core/components/profile-menu'
import { ThemeToggle } from '@/core/components/theme-toggle'
import { useSeo } from '@/core/hooks/use-seo'
import { useTranslation } from '@/core/providers/i18n/context'
import { reportWebVitals } from '@/core/utils/web-vitals'

export const Route = createFileRoute('/')({
  beforeLoad: ({ location }) => {
    const authed = validateAuthUser()

    if (!authed) {
      // redirect unauthorized user to login
      toast.error('Unauthorized')
      throw redirect({
        to: '/login',
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can potentially lag behind the actual current location)
          redirect: location.href,
        },
      })
    }
  },
  component: HomeRoute,
  onEnter() {
    reportWebVitals()
  },
})

function HomeRoute() {
  useSeo({
    title: 'Home',
    description: 'Welcome to our React.js application. Explore our modern, feature-rich web platform with theme customization, multi-language support, and user profiles.',
  })
  const { t } = useTranslation()

  return (
    <div
      className="container mx-auto flex flex-col items-center gap-y-2 py-24 duration-300"
    >
      <h1 className="text-3xl sm:text-4xl">{t('title')}</h1>
      <h2 className="font-mono text-xl sm:text-2xl">{t('welcome')}</h2>
      <WelcomeMessage />

      <div className="flex items-center gap-x-2">
        <ThemeToggle />
        <LanguageToggle />
        <ProfileMenu />
      </div>
    </div>
  )
}

function WelcomeMessage() {
  // it takes time to load the flag first, then it resolves to the correct value
  const home_welcome_message = useStringFlagValue('home_welcome_message', '')

  return <p className="font-mono text-sm">{home_welcome_message}</p>
}
