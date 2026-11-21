# Route Test harness

> Recorded on 2026-11-20 from the comments in `apps/spa/vitest.e2e.config.ts` and `apps/spa/e2e/support/` ([ADR-0011](./0011-code-carries-no-comments.md)). Builds on [ADR-0008](./0008-route-tests-run-in-vitest-browser-mode.md).

Route Tests run the whole SPA in a real Chromium through Vitest browser mode. `vitest.e2e.config.ts` is not a project of the root config, because `test:unit`, coverage and Stryker load the root config, and none of them may start a browser.

## Configuration

- **Hermetic.** No `.env*` file reaches a Route Test. The config pins each value that the app reads (including `VITE_API_BASE_URL` through `define`), so a run gives the same result on every machine.
- **No devtools.** `VITE_E2E` keeps the devtools out of `routes/__root.tsx`, because their overlays catch pointer events.
- `/mockServiceWorker.js` is served by the test server only. Nothing is written to `public/`, so the worker never ships in `dist`.
- The dependency scanner crawls the whole app before the first test. A dependency found during a run makes Vite reload the page, which is the usual browser-mode flake.
- Each file gets a new iframe, because the app is page-global (router, QueryClient, Persistence). `setup.ts` resets state between the tests of one file.
- No retries: a flaky test in a hermetic suite is a bug, and a retry hides it.
- The `expect.poll` timeout is longer than 1 s, because the first visit to a route loads a lazy chunk, which is slow on a cold CI machine.
- Reduced motion is on, so no assertion races an animation.
- Screenshots and traces of failures go to one folder that the report prints. `global-setup.ts` deletes the raw Playwright trace work files after the run and keeps one `*.trace.zip` for each failed test.
- Dependency sourcemaps are off in headless runs: they only help to step through `node_modules`.
- The browser-mode types live in `e2e/support/vitest-browser.d.ts`, outside `src/`, which never runs in browser mode.

## Support files

- `setup.ts` is a setup file, not an opt-in fixture, so no test can forget it. A test fails when the app sends a request that leaves the test server and no handler answers, or when anything calls `console.error`. Same-origin requests (modules, chunks, assets) are the test server's own. An expected `console.error` goes on a short allowlist, with a reason, matched as narrowly as possible.
- After each test, `setup.ts` unmounts first, so no route reacts to the resets. Then it reads each persisted atom again from the empty storage, because each atom caches its value.
- `renderRoute` loads the router after the mount. A Session change makes the Session gate reload the router on the old URL, and the mounted `Transitioner` skips its own load while that reload waits. The router waits for the mounted tree to accept each load, so a load before the mount never resolves.
- `renderRoute` imports the real stylesheet, because visibility assertions need the real layout (for example `hidden md:block`).
- `network.ts` uses fixed literals, never faker, so a failure reproduces the same way on every run (ADR-0002). It builds absolute URLs from the pinned API base URL, so the app and the handlers cannot drift. It accepts and drops telemetry exports, which go same-origin in dev.
