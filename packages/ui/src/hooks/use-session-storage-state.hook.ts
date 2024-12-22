import { createUseStorageState } from '@workspace/ui/hooks/create-use-storage-state'

/**
 * A Hook for store state into `sessionStorage`.
 */
export const useSessionStorageState = createUseStorageState(
  () => sessionStorage,
)
