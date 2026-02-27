# @workspace/web

## 🔧 Fixme

- [ ] sitemap still does not work when we run `bun web build`. That's why we rename it into `sitemap.txt`.
- [ ] fix e2e tests

## 🎯 Todo

- [ ] install orpc (no agent skills yet)
- [ ] consider using `@tanstack/react-form` instead of `react-hook-form` (`next-safe-action` still does not support `@tanstack/react-form`)
- [ ] drizzle beta
- [ ] database seeding script with `drizzle-seed`

## Testing

**CI limitation**: We can’t run E2E in CI yet because auth must be mocked on the server (RSC/server actions), and `next.onFetch` (Next experimental test mode) only intercepts external `fetch`, not relative URLs handled by Next route handlers. So tests run locally with a local DB.

## Auth

When adding/removing/changing auth schema:

```bash
bun hono auth:gen
bun hono db:gen
bun hono db:migrate
```

OpenAPI reference: `http://localhost:3002/api/auth/reference`
