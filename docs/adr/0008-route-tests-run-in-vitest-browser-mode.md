# Route Tests run in Vitest browser mode

The spa end-to-end suite moved from the Playwright test runner to Vitest browser mode with the Playwright provider. The tests stay at route level: each **Route Test** (see `apps/spa/GLOSSARY.md`) mounts the whole app — `<Entry />`, the production `router` singleton, the real browser history — at one URL in a real headless Chromium. Every route, guard, provider and translation is the real one. Only the network is faked, with `msw/browser`.

The old suite started a Vite dev server (or a build and a preview server on CI), sent its requests to the real DummyJSON API, and signed in once through a setup project that saved a storage state. So a run depended on a third-party service and on an env file, and a failure could come from the network, the server or the test. The new suite needs no server process, no env file, no secret and no external host. It starts the same Vite pipeline as the app, inside the Vitest runner that the unit tests already use.

## Decisions

- **Files and config.** Tests are `apps/spa/e2e/*.e2e.test.tsx`. Support code is in `apps/spa/e2e/support/`. They run from `apps/spa/vitest.e2e.config.ts`, which merges `vite.config.ts`. It is **not** a project of the root `vitest.config.ts`: `test:unit`, coverage and Stryker load the root config, and none of them may start a browser. The scripts are `bun spa test:e2e` (also `bun spa:test:e2e` from the root), `test:e2e:watch`, `test:e2e:headed`, and `test:install` for Chromium.
- **Chromium only, headless.** File parallelism is on, `isolate: true` gives each file a new iframe, and `retry: 0`. The suite is hermetic, so a flaky test is a bug, and a retry would hide it.
- **Hermetic env.** `envDir: false` stops every `.env*` file. The config pins each `import.meta.env` value that the app reads, so a run gives the same result on every machine and on CI.
- **Network at the boundary.** `msw/browser` `setupWorker` intercepts every request, as `setupServer` does for the unit tests in [ADR-0002](./0002-network-boundary-mocking-with-msw.md). The `msw/vite` plugin runs in `worker-only` mode: it serves `/mockServiceWorker.js` from the test server only, and writes nothing to `public/`, so the worker can never ship in `dist`. `e2e/support/network.ts` holds the default happy-path handler set. A test replaces one handler with `worker.use(...)`, and `setup.ts` resets the overrides after each test.
- **No app factory.** The tests mount the real `Entry` and the production `router` singleton. A factory that builds a separate router or QueryClient per test would test a composition that production does not use. The cost is page-global state, and `e2e/support/setup.ts` resets it after each test: unmount, clear the QueryClient, clear `localStorage`, and refresh each persisted atom.
- **Session through Persistence.** `renderRoute(path, { session })` writes the Session through `persistence.registry.set(persistence.sessionAtom, …)`, not through raw `localStorage`, so a change to how the Session is stored cannot leave the tests behind. The login Route Test still signs in through the form.
- **Mount, then load.** `renderRoute` sets the Session, replaces the history entry, mounts `<Entry />`, and only then calls `router.load()`. The order is necessary. The `Transitioner` of the router waits for the mounted tree to acknowledge each load. Before the mount, the only listener is the tree that the last test unmounted, so a load before the mount never resolves. Also, a Session change makes the Session gate reload the router on the *old* URL, and the mounted `Transitioner` skips its own load while that reload is pending. The load after the mount reads the new URL and replaces the stale one.
- **Guards.** `e2e/support/setup.ts` is a setup file, not an opt-in fixture, so no test can forget it. A test fails when the app sends a request that leaves the test server and no handler answers it, and when anything calls `console.error` that is not on the allow list. Each failure message names the request or the error. Uncaught errors and unhandled rejections already fail the run in Vitest.
- **Locale is not pinned.** Assertions on text use two-language patterns (English|Indonesian, for example `/login|masuk/iu`), so the tests pass in each supported Locale.
- **Debug artifacts.** On a failure, Vitest saves a screenshot and a Playwright trace (`retain-on-failure`) under `apps/spa/e2e/.artifacts/`, and prints their paths in the report. A person or an agent can open them directly; `npx playwright show-trace <file>` opens a trace. CI uploads the folder when the job fails. The folder is in `.gitignore`.
- **No coverage.** Route Tests do not collect coverage. Coverage stays whole-suite for the unit tests only ([ADR-0001](./0001-unit-tests-are-pure-module-logic.md)).

## Route Tests do not run on pull requests

`.github/workflows/e2e.yml` runs on `workflow_dispatch` (any branch) and on push to `main`. It does not run on pull requests, and it gates nothing: `main` has no branch protection and no required status checks.

This decision is older than the move to Vitest. In 2026-08, the Playwright suite was moved out of `ci.yml` into its own workflow. That decision was linked as "ADR-0004", but no record was written, and the number was later used for [ADR-0004](./0004-module-resolution-has-a-single-source-of-truth.md). This section is the record. The reasons:

1. **Cost on every pull request.** A browser job downloads Chromium and its OS packages and runs a second Vite pipeline. That added minutes to every pull request for a small template.
2. **A separate file.** A `workflow_dispatch` trigger on `ci.yml` would also start sherif, gitleaks, fallow, lint, unit tests and both builds on every manual run.
3. **A signal, not a gate.** The push to `main` still gives a signal for the merged state, and anyone can start a run on a branch before a merge.

The move to a hermetic suite removes the main flake source (the external API), so this decision is now easier to reverse. That is a separate decision; this ADR keeps the trigger as it is.

## Considered Options

- **Keep the Playwright test runner** — rejected. It needs a dev or preview server, an env file, a storage-state setup project, and (without `page.route`) the real API. It also controls the app only from outside, so a test cannot set the Session through Persistence or reset app state between tests.
- **Playwright test runner with `page.route` mocks** — rejected. It removes the external API, but it keeps the server process and the outside-only control, and it is a second mocking style next to MSW.
- **React Testing Library in jsdom or happy-dom** — rejected. [ADR-0001](./0001-unit-tests-are-pure-module-logic.md) keeps DOM shims out of the unit suite, and a DOM shim is not a real browser: no layout, so visibility assertions (for example `hidden md:block`) cannot be true.
- **A browser project in the root `vitest.config.ts`** — rejected. `test:unit`, coverage and Stryker load that config and would start a browser.
- **An app factory per test** — rejected; see "No app factory" above.
- **Retries** — rejected; see "Chromium only, headless" above.

## Consequences

- `@playwright/test` is gone. `apps/spa` declares `playwright`, `@vitest/browser-playwright` and `vitest-browser-react`. The CI browser cache key comes from the `playwright` package version.
- `apps/spa/tsconfig.node.json` includes `vitest.e2e.config.ts` and the one support file it imports (`e2e/support/constants.ts`), so `MOCK_API_BASE_URL` is defined once for Node and the browser.
- `optimizeDeps.entries` lists the app entry, every route and the e2e files, so Vite crawls all dependencies before the first test. A dependency found during a run makes Vite reload the page, which is the usual browser-mode flake.
- The CI job has no `environment`, no env file step, no build and no preview server.
