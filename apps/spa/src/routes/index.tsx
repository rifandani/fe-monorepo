import { validateAuthUser } from '@/auth/utils/storage'
import { LanguageToggle } from '@/core/components/language-toggle'
import { ProfileMenu } from '@/core/components/profile-menu'
import { ThemeToggle } from '@/core/components/theme-toggle'
import { useI18n } from '@/core/hooks/use-i18n'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { toast } from 'sonner'

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
})

function HomeRoute() {
  const [t] = useI18n()

  return (
    <div
      className="container mx-auto flex flex-col items-center gap-y-2 py-24 duration-300"
    >
      <h1 className="text-3xl sm:text-4xl">{t('title')}</h1>
      <h2 className="font-mono text-xl sm:text-2xl">{t('welcome')}</h2>

      <div className="flex items-center gap-x-2">
        <ThemeToggle />
        <LanguageToggle />
        <ProfileMenu />
      </div>
    </div>
  )
}
