import { useAuthUserStore } from "@/auth/hooks/use-auth-user-store";

/**
 * @description Whether a Session exists. Safe to call outside React — a route
 * `beforeLoad` is the main caller.
 *
 * Reads the store rather than `localStorage`. Zustand's persist middleware
 * rehydrates during `create()` when the storage is synchronous, which
 * `localStorage` is, so the Session is in the store before any route resolves.
 * Hand-parsing the persisted envelope here would be a second source of truth
 * that disagrees with the store exactly during rehydration. If this app ever
 * moves to an asynchronous storage, that stops being true and this needs
 * revisiting.
 */
export const hasValidSession = () => useAuthUserStore.getState().user !== null;
