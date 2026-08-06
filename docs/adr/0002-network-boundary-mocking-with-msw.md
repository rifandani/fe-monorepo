# Network-boundary mocking with MSW

The four unit tests covering the API layer faked HTTP by replacing imports (`vi.mock("ky")`, `vi.mock("@/core/services/http")`, hand-rolled `{ instance: { post } }` objects), so real ky never ran and a wrong prefix, dropped header, or bad path template could not fail a test. They now fake at the network boundary with `msw@2` (`setupServer`, Node only), which runs real ky, real URL construction, and real Zod parsing. This does **not** widen ADR-0001's scope: unit tests remain pure module logic under `environment: "node"` — no jsdom, no RTL, no browser mode, no `msw/browser`. Playwright mocking is unchanged (`apps/web` keeps `next/experimental/testmode/playwright`; `apps/spa` keeps hitting the real API).

## Vocabulary

> **Network Boundary** — where a request leaves the process (`fetch`/`http`/`XHR`). MSW fakes here, so everything the module does to build and parse the request really executes.
>
> **Module Boundary** — where an import is replaced (`vi.mock`). Faking here skips everything the replaced module would have done.

**Rule of thumb: if the subject under test builds or parses an HTTP request, fake at the Network Boundary; otherwise fake at the Module Boundary.** Both idioms are legitimate; mixing them in one file is a smell.

## Scope

MSW applies to exactly four files — `packages/core/src/apis/{auth,better-auth,cdn}.unit.test.ts` and `apps/expo/src/user/apis/user.unit.test.ts`. That is the complete set: `apps/spa/src` and `apps/web/src` have no `apis/` directory and consume core's repositories, and no other test in the suite touches the network.

## Considered Options

- **Keep module-boundary mocks** — rejected; they cannot observe the request, which is most of what these modules do.
- **Fixtures from faker, shared with the `e2e/_helper.ts` builders** — rejected; unit failures must reproduce identically, and faker belongs where the point is "any valid user works". Fixtures stay as fixed literals.
- **Fixtures derived from the Zod schemas** — rejected, and actively harmful: these modules exist to run `schema.parse(response)`, so a fixture generated from that schema can never fail it and the most valuable assertion becomes vacuous. Instead each file now has a *schema-violating 200* case alongside 401/404/500.
- **`expect()` inside a resolver** — rejected as the documented anti-pattern. A throwing resolver becomes a failed response, so ky raises an `HTTPError` and the report shows a confusing 500 instead of the assertion. It also passes silently if the resolver never runs. **Use capture-then-assert**: stash the request/body in the resolver, assert in the test body after the `await`. Where the URL is the method's only input, the handler matching *is* the assertion — no request assertion needed.
- **A shared handler catalog, or handlers inside `packages/core/src/mocks/`** — rejected; test-only code does not belong in the package every app imports from, and `packages/core`'s `exports` map has no entry for it. Root-level `vitest.msw.ts` matches the existing `vitest.{config,setup,env-mock}.ts` convention and sits beside the setup file that owns its lifecycle.
- **Re-exporting `http`/`HttpResponse` through `vitest.msw.ts`** — rejected; handlers should look like textbook MSW so every upstream example applies. Test files import `msw` directly (root-hoisted devDependency, exactly as `vitest` already is — neither is declared in `packages/core/package.json`).
- **A global server in `vitest.setup.ts`** — rejected on measurement, see below.

## Lifecycle: scoped, not global

`server.listen()` lives in `vitest.msw-setup.ts`, added to `setupFiles` for the `core` and `expo` projects only. A single `setupServer` instance is shared process-wide, which matters because the root config runs `pool: "threads"` with `isolate: false`: files in a worker share globals, and two interceptor instances would contend for the same patched `fetch`/`http`/`XHR`.

The global alternative was preferred on design grounds — it would make "no unit test ever reaches the network" an invariant for all 55 files — but it was measured first and the cost decided it. Warm runs, 55 files:

| Config | Files with interceptors | Warm duration | Cumulative setup |
| --- | --- | --- | --- |
| Before MSW | 0 | 3.07s | 858ms |
| Global (`vitest.setup.ts`) | 55 | 3.72–4.33s (**+21–40%**) | 7.3–8.5s |
| **Scoped (core + expo)** | 22 | 3.05–3.28s (**+3%**) | 2.5–3.2s |

Interceptor install costs ~140ms per *file*, so the bill scales with files touched, not tests. Paying +21–40% to guard 33 files that make no requests at all was poor value; ADR-0001's coverage amendment accepted +29% for something every file benefits from.

`onUnhandledRequest: "error"` (not `"warn"`) — verified by probe: an undeclared request hard-fails with `[MSW] Error: intercepted a request without a matching request handler`. Nothing in the suite trips it, because every OTLP exporter and evlog transport is already `vi.mock`ed.

**Consequence:** the guardrail covers `core` and `expo` (22 files), not `spa` and `web` (33). Extending it is one line in that project's `setupFiles`, and any spa/web test that needs the network must add it.

## Consequences

- **`auth.ts`'s `afterResponse` hook was deleted.** It set `Authorization` on `request.headers` *after* the response returned, only on status 200 — and ky (verified in `2.0.2`, `distribution/core/Ky.js:623`) passes `response.clone()` and never retries a 200, so nothing read the mutated request. It was a no-op. The old test could only "pass" by pulling the hook out of `post.mock.calls[0]` and invoking it by hand; two of four tests existed to do that, asserting the body *ran* rather than that it *did* anything. Under MSW the effect is unobservable, which is how the dead code surfaced. Coverage branches went 99.51% → **100%** as a result; the whole suite is now 100/100/100/100 against the `perFile: 90` floor.
- **`apps/expo/vitest.config.ts` gained an `env` block.** Faking at the Network Boundary means `user.ts`'s import graph really loads, including `createEnv({ EXPO_PUBLIC_API_BASE_URL: z.url() })`, which throws without a valid URL. It imports `MOCK_API_BASE_URL` from `vitest.msw.ts` so the value is defined once. Expo-only: its `createEnv` reads `process.env`, which is what Vitest's `env` populates, whereas spa and web read `import.meta.env`/`experimental__runtimeEnv`.
- **Follow-up not taken:** `userApi` should accept `http` as a parameter like `authRepositories(http)` does, removing the singleton/env coupling at the source. Deliberately deferred — bundling a production refactor into a testing change makes the diff hard to review.
- **`@test/msw` is aliased twice per project** — in `vitest.config.ts` (`resolve.alias`) and `tsconfig.json` (`paths`) — for `core` and `expo` only. Not added to spa/web, which would be dead config.
- **ky retries GET twice by default** on 408/413/429/500/502/503/504, so the cdn 500 case passes `retry: 0` to avoid ~0.9s of backoff. POST is not retried by default, so the auth/better-auth 500 cases need nothing.
- **fallow:** `vitest.msw-setup.ts` needs `unused-files: "off"` in `.fallowrc.json`, since `setupFiles` loads it by path and no import edge reaches it. Separately, `fallow dead-code` reports `msw` under "dev dependencies used in production" because it counts `*.unit.test.ts` under `src/` as production; every `msw` import site is a test file or `vitest.msw.ts`, it must stay a devDependency, and the finding is not suppressible via rule severity (the same limitation already noted for `fallow security`). Both `check:dead-code` and `check:audit` exit 0, so it is informational.
