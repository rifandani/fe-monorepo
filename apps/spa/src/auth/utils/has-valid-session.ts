import { authUserStore } from "@/auth/stores/auth-user-store";

/**
 * @description Whether a Session exists. Safe to call outside React — a route
 * `beforeLoad` is the main caller.
 *
 * Reads the atom rather than `localStorage`. `Atom.kvs` over the synchronous
 * `localStorage` runtime decodes the persisted value on the first read, so the
 * Session is in the registry before any route resolves. Hand-parsing the entry
 * here would be a second source of truth. If this app ever moves to an
 * asynchronous storage, that stops being true and this needs revisiting.
 */
export const hasValidSession = () => authUserStore.get() !== null;
