import { setupServer } from "msw/node";

/**
 * Base URL that every `Http` instance under test is pointed at, and the origin
 * every handler matches on. `setupServer` runs in Node with no `document.baseURI`,
 * so handler paths must be absolute — hence a shared constant rather than a
 * relative pattern. `apps/expo/vitest.config.ts` imports it for its `env` block so
 * the value is defined exactly once.
 *
 * Rationale and the Network Boundary / Module Boundary rule live in
 * docs/adr/0002-network-boundary-mocking-with-msw.md.
 */
export const MOCK_API_BASE_URL = "https://api.test";

/**
 * One process-wide interceptor, deliberately created with **no default handlers**.
 *
 * Every test declares the requests it expects via `server.use()`, and anything
 * unhandled fails the run — `vitest.setup.ts` owns the lifecycle and passes
 * `onUnhandledRequest: "error"`. A single instance is not merely tidy here: the
 * root `vitest.config.ts` runs `pool: "threads"` with `isolate: false`, so files
 * in a worker share globals, and two `setupServer` instances would contend for the
 * same patched `fetch`/`http`/`XHR`.
 */
export const server = setupServer();
