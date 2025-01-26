import { Navbar } from '@/core/components/navbar/navbar'
import { RouteErrorBoundary } from '@/core/components/route-error-boundary'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { checkAuthUser } from '@/core/utils/checker.util'
import { HomeClock } from '@/home/components/home-clock'
import { useAutoAnimate } from '@formkit/auto-animate/react'
import { type ClientLoaderFunction, redirect } from 'react-router'
import { toast } from 'sonner'

export const clientLoader: ClientLoaderFunction = () => {
  const authed = checkAuthUser()

  // redirect NOT authed user to login
  if (!authed) {
    toast.error('Unauthorized')
    return redirect('/login')
  }

  return null
}

export const ErrorBoundary = RouteErrorBoundary

export default function Home() {
  const [t] = useI18n()
  const [parentRef] = useAutoAnimate()

  return (
    <>
      <Navbar />

      <main
        ref={parentRef}
        className="container mx-auto flex flex-col items-center py-24 duration-300"
      >
        <h1 className="text-3xl sm:text-4xl">{t('title')}</h1>

        <HomeClock />
      </main>
    </>
  )
}
