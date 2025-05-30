import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTranslation } from '@/core/providers/i18n/context'

// replaced dynamically
const buildDate = '__DATE__' as '__DATE__' | Omit<string, '__DATE__'>
const reloadSW = '__RELOAD_SW__' as '__RELOAD_SW__' | 'true'

export function ReloadPromptSw() {
  const onRegisteredSW = useCallback(
    (_swUrl: string, registration: ServiceWorkerRegistration | undefined) => {
      // in `vite.config.ts`, the `reloadSW` could be `'true'` if `process.env.RELOAD_SW === 'true'`
      if (reloadSW === 'true' && registration) {
        setInterval(() => {
          // eslint-disable-next-line no-console
          console.log('🔵 Updating Service Worker...')
          void registration.update()
        }, 10_000 /* 10s for testing purposes */)
      }
      else {
        // eslint-disable-next-line no-console
        console.log('✅ Service Worker registered', registration)
      }
    },
    [],
  )

  const onRegisterError = useCallback((error: unknown) => {
    console.error('🛑 Service Worker registration error', error)
  }, [])

  const { t } = useTranslation()
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // immediate: true,
    onRegisteredSW,
    onRegisterError,
  })

  // listens to reload prompt SW
  useEffect(() => {
    if (offlineReady || needRefresh) {
      toast(offlineReady ? t('appReady') : t('newContentAvailable'), {
        closeButton: true,
        duration: 60 * 1_000,
        onDismiss: () => {
          setOfflineReady(false)
          setNeedRefresh(false)
        },
        ...(needRefresh && {
          action: {
            label: t('reload'),
            onClick: () => updateServiceWorker(true),
          },
        }),
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineReady, needRefresh])

  return (
    <aside id="ReloadPromptSW" className="hidden">
      {buildDate}
    </aside>
  )
}
