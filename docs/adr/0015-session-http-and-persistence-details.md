# Session, Http and Persistence details

> Recorded on 2026-11-20 from the comments in `packages/core/src/lib/{session,http,auth,persistence,cdn}`, `packages/core/src/utils/error.ts`, the app layers and the SPA Session gate ([ADR-0011](./0011-code-carries-no-comments.md)). Builds on [ADR-0006](./0006-core-owns-the-effect-seams.md) and [ADR-0010](./0010-session-lifecycle-is-an-xstate-machine.md).

## Session

- End Session does not navigate. In the SPA, the Session gate reloads the router when `sessionAtom` changes, so the route guards run again. In Expo, `Stack.Protected` reads `sessionAtom`. In both apps, the end of the Session is the navigation. End Session also clears the query cache (`onEnd`), so the next Session never reads the data of the previous one. It discards the Session before `onEnd` runs, so `onEnd` never sees it.
- The Access Token is read for each request, so a sign-in or a sign-out never needs to notify a client.
- `sessionActivityAtom` is a plain atom that `Session.layer` writes, not `createActorAtoms` from `@xstate/effect/atom`, which starts a second actor.
- The machine invokes stand-ins, which `provideSessionMachine` replaces, so `sessionMachine` stays static and graph tools can read it. Their types are the contract for the real work.
- `START` uses `reenter`: a second login while one is kept restarts with the new Session.
- The refresh task refreshes only when the rejected Access Token is still the current one. Otherwise another refresh or a login already replaced it, and the caller retries with the current token.
- `sendAndAwait` resolves when the actor takes the event. The work runs in an invoked task that is done when the actor is back in `idle`; from then on, the atom holds the result. The actor stops only when the Layer closes, and a caller that still waits then gets the fallback value.
- `Session.layerMemory` is a second adapter at the same seam, for tests. Its default `SessionRefresh.layerRejecting` refuses every refresh token, which is the behavior without token refresh.
- A refresh rotates both tokens. `SessionRefreshError` has two reasons: `Rejected` (the server refused the refresh token; End Session follows) and `Failed` (network, timeout, 5xx, a body that breaks the schema; the Session stays, and the request that started the refresh fails).

## Http

- A 401 on a request that carried a Session token starts one Session Refresh and one retry with the new token. A failed sign-in (a 401 with no Session) or a request with a caller-set header never starts a refresh. A second 401 is the answer.
- The retried request is already preprocessed (base URL, `Accept`), so it goes to `postprocess` only.
- The refresh request goes on `Http.layerWithoutSession`, because the Access Token that it replaces was already rejected, and so that a refused refresh never starts another refresh.
- A failed response body that cannot be read counts as absent: the status code is still the true part of the failure. `HttpResponseError.data` is parsed JSON, raw text, or absent.
- The SPA sends trace headers (`traceparent`, `b3`) only when the API is same-origin (the dev proxy). Cross-origin, they make each request a CORS preflight that the API must allow.
- CDN files are at absolute URLs outside the API, so CDN requests use the plain transport `HttpClient`: no base URL and no Session. A query `signal` interrupts the Effect, which aborts the fetch.
- `urlSchema` uses `URL.canParse`, so the rule is the platform's own. `emailSchema` is loose on purpose: the server owns the address rules.

## Error messages (`toErrorMessage`)

- The order: the Error Envelope of the API; a plain-text error body; the error's own message (developer-facing but true); a generic message. A `SchemaError` gets the generic message, because naming the field leaks internals into a toast.
- A `SchemaError` is matched by `_tag`, not by `instanceof`: each app resolves its own `effect`, and a second copy makes `instanceof` false.
- It takes `unknown`, because `onError` and `query.error` carry a union that nothing checks at runtime. The error body is parsed with a schema, not checked with `typeof`.

## Persistence and env

- Each persisted value has its own key, so End Session never touches the theme or the Locale. Each value is an `Atom.kvs` that is decoded on every read, so a stale or edited entry reads as the default. Each atom is `keepAlive`, because code outside React reads it.
- There is one registry per app. `PersistenceProvider` gives it to React; `RegistryProvider` would make a second registry that code outside React cannot reach.
- `localStorage` and MMKV are synchronous, so each atom holds its persisted value on the first read, before any route resolves. The Session gate depends on this. If the app moves to asynchronous storage, revisit the gate.
- The default Locale is a function called on the first read, so it can read the browser or the device.
- Each env variable is read with static dot notation (`import.meta.env.VITE_X`, `process.env.EXPO_PUBLIC_X`), because the bundlers only inline that form. Each value is an Effect `Config`, so a missing or bad variable fails the runtime with a `ConfigError` that names the key.
- The runtime type annotation lists every service. `Layer` output is contravariant, so a missing service is a compile error. The SPA runtime is never disposed: it lives as long as the tab.

## SPA Session gate (`app/providers/router/session-gate.ts`)

- It is the one place that decides which routes need a Session. `beforeLoad` runs on a navigation only, so `watch` reloads the router when the Session appears or disappears (not when it changes inside one Session). Toasts appear only on a navigation to the wrong place, not on a reload that the gate caused. It is a factory so that a test can give it in-memory Persistence.
- `redirect` is kept only when it is a path of this app, to prevent an open redirect. Browsers read `\`, tabs and new lines as `/`, so the gate parses the URL and compares the origin; it does not match text. `/login` itself is refused, because it would loop. A bad value becomes an explicit `undefined`, because the router merges the validated search over the raw one.
- The return location is the current location, not `router.state.resolvedLocation`, which can lag.
