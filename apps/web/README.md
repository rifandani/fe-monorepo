# @workspace/web

## 🎯 Todo

- [ ] sitemap still does not work when we run `bun web build`. That's why we rename it into `sitemap.txt`.
- [ ] fix e2e tests
- [ ] install orpc (no agent skills yet)
- [ ] consider using `@tanstack/react-form` instead of `react-hook-form` (`next-safe-action` still does not support `@tanstack/react-form`)
- [ ] instrumentation using vercel otel
- [ ] drizzle beta

## Auth

When adding/removing/changing auth schema:

```bash
bun hono auth:gen
bun hono db:gen
bun hono db:migrate
```

OpenAPI reference: `http://localhost:3002/api/auth/reference`
