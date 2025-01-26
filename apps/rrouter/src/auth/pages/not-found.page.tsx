import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store.hook'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { Link } from '@workspace/core/components/link'
import { useColorMode } from '@workspace/core/hooks/use-color-mode.hook'

export default function NotFound() {
  const userStore = useAuthUserStore()
  const [t] = useI18n()
  useColorMode({})

  return (
    // bg-[0_0_,10px_10px]
    <div className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(hsl(var(--primary))_0.5px_,transparent_0.5px),radial-gradient(hsl(var(--primary))_0.5px_,hsl(var(--background))_0.5px)] bg-[length:20px_20px] font-mono opacity-80">
      <h1 className="text-primary text-8xl font-bold tracking-wider">404</h1>
      <h2 className="my-3 text-2xl font-semibold">{t('notFound')}</h2>
      <p className="">{t('gone')}</p>

      <Link
        href={userStore.user ? '/' : '/login'}
        className="mt-10 transition duration-300 hover:skew-x-12"
      >
        {t('backTo', { target: userStore.user ? 'home' : 'login' })}
      </Link>
    </div>
  )
}
