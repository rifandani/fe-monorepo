import { OpenFeature, OpenFeatureProvider, ProviderEvents } from '@openfeature/react-sdk'
import { logger } from '@workspace/core/utils/logger'
import { type ComponentPropsWithoutRef, type PropsWithChildren, useEffect } from 'react'
import { useAuthUserStore } from '@/auth/hooks/use-auth-user-store'
import { flagsmithClientProvider } from './client'

// Instantiate and set our provider (be sure this only happens once)!
// Note: there's no need to await its initialization, the React SDK handles re-rendering and suspense for you!
OpenFeature.setProvider(flagsmithClientProvider)
// add a hook globally, to run on all evaluations
// OpenFeature.addHooks(new FlagHook())
// add an error event handler to the provider
OpenFeature.addHandler(ProviderEvents.Error, (event) => {
  logger.error('[OpenFeatureHandler]: error', event)
})

export function FlagsProvider({ children, ...props }: PropsWithChildren<ComponentPropsWithoutRef<typeof OpenFeatureProvider>>) {
  const { user } = useAuthUserStore()

  // sync user context to feature flags context
  useEffect(() => {
    if (user) {
      const { accessToken, refreshToken, ...traits } = user
      OpenFeature.setContext({ targetingKey: user.username, traits })
    }
    else {
      OpenFeature.clearContext()
    }
  }, [user])

  return (
    <OpenFeatureProvider {...props}>
      {children}
    </OpenFeatureProvider>
  )
}
