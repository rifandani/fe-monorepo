# Unit tests are pure module logic only

We run Vitest projects (`core`, `spa`, `web`, `expo`) for Unit tests: utils, libs, registries, plain classes, non-React factories, and Zustand stores via `.getState()`. React components/hooks (RTL, hook harnesses), plain Zod shapes, coverage, Vitest UI, and browser mode are out of scope — UI behavior belongs in Playwright E2E. Files are `*.unit.test.ts` under `environment: 'node'` with shared polyfills; CI jobs are `core-unit`, `spa-unit`, `web-unit`, `expo-unit`.

## Considered Options

- React Testing Library for components/hooks — rejected; duplicates E2E cost and slows the suite
- happy-dom/jsdom by default — rejected; Node + targeted mocks is faster for pure logic
- Coverage gates — rejected; optimize for wall-clock speed, not % lines
