import { createUseStorageState } from "@workspace/core/hooks/create-use-storage-state";

export const useLocalStorageState = createUseStorageState(() => localStorage);
