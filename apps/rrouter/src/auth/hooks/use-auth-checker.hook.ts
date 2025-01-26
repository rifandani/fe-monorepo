import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store.hook'
import { useI18n } from '@/core/hooks/use-i18n.hook'
import { useMount } from '@workspace/core/hooks/use-mount.hook'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { match, P } from 'ts-pattern'

/**
 * Hooks to check the authentication of your user, wheter they're logged in or not
 *
 * @example
 *
 * ```tsx
 * useAuthChecker()
 * ```
 */
export function useAuthChecker() {
  const [t] = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthUserStore()

  useMount(() => {
    match([!!user, location.pathname.includes('login')])
      .with([false, true], () => {})
      .with([false, P.any], () => {
        navigate('/login', { replace: true })
        toast.error(t('unauthorized'))
      })
      .with([true, true], () => {
        navigate('/')
        toast.info(t('authorized'))
      })
      .otherwise(() => {})
  })
}
