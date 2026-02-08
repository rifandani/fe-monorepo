'use client'

import { flagsmithClientProvider } from './client'
import { OpenFeature, OpenFeatureProvider, ProviderEvents } from '@openfeature/react-sdk'
import type { AuthGetSessionResponseSchema } from '@workspace/core/apis/better-auth'
import { logger } from '@workspace/core/utils/logger'
import type { ComponentPropsWithoutRef, PropsWithChildren } from 'react'
import { useEffect } from 'react'

// Instantiate and set our provider (be sure this only happens once)!
// Note: there's no need to await its initialization, the React SDK handles re-rendering and suspense for you!
OpenFeature.setProvider(flagsmithClientProvider)
// add a hook globally, to run on all evaluations
// OpenFeature.addHooks(new FlagHook())
// add an error event handler to the provider
OpenFeature.addHandler(ProviderEvents.Error, (event) => {
  logger.error('[OpenFeatureHandler]: error', event)
})

export function FlagsProvider({ children, user, ...props }: PropsWithChildren<ComponentPropsWithoutRef<typeof OpenFeatureProvider>> & { user: NonNullable<AuthGetSessionResponseSchema>['user'] | null }) {
  // sync user context to feature flags context
  useEffect(() => {
    if (user) {
      const { id, ...traits } = user
      OpenFeature.setContext({
        targetingKey: id,
        traits,
      })
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
