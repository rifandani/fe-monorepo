import { useTranslation } from '@/core/providers/i18n/context'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(period: number, swUrl: string, r: ServiceWorkerRegistration) {
  // eslint-disable-next-line no-console
  console.log('✅ SW activated', r)

  if (period <= 0)
    return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine)
      return

    // eslint-disable-next-line no-console
    console.log('🔵 Checking for SW updates...')
    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200) {
      // eslint-disable-next-line no-console
      console.log('🔵 Updating SW...')
      await r.update()
    }
  }, period)
}

export function ReloadPromptSw() {
  // check for updates every hour
  const period = 60 * 60 * 1_000

  const onRegisteredSW = useCallback(
    (swUrl: string, r: ServiceWorkerRegistration | undefined) => {
      if (period <= 0)
        return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      }
      else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker
          if (sw.state === 'activated') {
            registerPeriodicSync(period, swUrl, r)
          }
        })
      }
    },
    [period],
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
        duration: 60 * 1_000, // 1 minute
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
    <aside id="ReloadPromptSW" className="hidden" />
  )
}
