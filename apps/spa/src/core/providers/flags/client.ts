import { ENV } from '@/core/constants/env'
import { FlagsmithClientProvider } from '@openfeature/flagsmith-client-provider'
import type { EvaluationDetails, FlagValue, Hook, HookContext, HookHints } from '@openfeature/react-sdk'
import { logger } from '@workspace/core/utils/logger'

// const flagConfig = {
//   'new-message': {
//     disabled: false,
//     variants: {
//       on: true,
//       off: false,
//     },
//     defaultVariant: 'on',
//     contextEvaluator: (context: EvaluationContext) => {
//       if (context.silly) {
//         return 'on'
//       }
//       return 'off'
//     },
//   },
// }
// export const flagsmithClientProvider = new InMemoryProvider(flagConfig)
export const flagsmithClientProvider = new FlagsmithClientProvider({
  api: ENV.VITE_FLAGSMITH_API_URL, // default to 'https://edge.api.flagsmith.com/api/v1/'
  environmentID: ENV.VITE_FLAGSMITH_ENVIRONMENT_ID,
  // realtime: true, // only for enterprise plan
  // cacheFlags: true,
  enableAnalytics: true,
  enableLogs: import.meta.env.DEV, // ENV.DEV will trigger error
  onError(err) {
    logger.error('[FlagsmithClientProvider]: error', err.message)
  },
})

/**
 * Hooks are a mechanism that allow for the addition of arbitrary behavior at well-defined points of the flag evaluation life-cycle.
 * Use cases include validation of the resolved flag value, modifying or adding data to the evaluation context, logging, telemetry, and tracking.
 *
 * @example
 *
 * // add a hook globally, to run on all evaluations
 * OpenFeature.addHooks(new FlagHook());
 *
 * // add a hook on this client, to run on all evaluations made by this client
 * const client = OpenFeature.getClient();
 * client.addHooks(new FlagHook());
 *
 * // add a hook for this evaluation only
 * const value = await client.getBooleanValue(FLAG_KEY, false, context, {
 *   hooks: [new FlagHook()],
 * });
 */
export class FlagHook implements Hook {
  before(hookContext: HookContext, hookHints?: HookHints) {
    // code to run before flag evaluation
    logger.log('[FlagHook]: before', { hookContext, hookHints })
  }

  after(hookContext: HookContext, evaluationDetails: EvaluationDetails<FlagValue>, hookHints?: HookHints) {
    // code to run after successful flag evaluation
    logger.log('[FlagHook]: after', { hookContext, evaluationDetails, hookHints })
  }

  error(hookContext: HookContext, err: Error, hookHints?: HookHints) {
    // code to run if there's an error during before hooks or during flag evaluation
    logger.error('[FlagHook]: error', { hookContext, err, hookHints })
  }

  finally(hookContext: HookContext, evaluationDetails: EvaluationDetails<FlagValue>, hookHints?: HookHints) {
    // code to run after all other stages, regardless of success/failure
    logger.log('[FlagHook]: finally', { hookContext, evaluationDetails, hookHints })
  }
}
