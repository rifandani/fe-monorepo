# Testing

Playwright E2E. Install browsers once:

```bash
bun test:install
```

```bash
bun test        # run in terminal
bun test:ci     # CI with sharding
bun test:report # show report
```

**CI limitation**: We can’t run E2E in CI yet because auth must be mocked on the server (RSC/server actions), and `next.onFetch` (Next experimental test mode) only intercepts external `fetch`, not relative URLs handled by Next route handlers. So tests run locally with a local DB.
