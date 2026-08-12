# @workspace/web

## 🔧 Fixme

~

## 🎯 Todo

- [ ] drizzle beta
- [ ] [Next 16.3](https://nextjs.org/blog/next-16-3)

## Testing

**CI limitation**: We can’t run E2E in CI yet because auth must be mocked on the server (RSC/server actions), and `next.onFetch` (Next experimental test mode) only intercepts external `fetch`, not relative URLs handled by Next route handlers. So tests run locally with a local DB.

## Auth

```bash
# everytime we add/remove/change auth schema, generate the new auth schema in `./src/db/auth-schema.ts`
bun web auth:gen
```

The generated `./src/db/auth-schema.ts` file should be used ONLY to compare with the existing schema in `./src/db/schema.ts`. Compare manually and copy paste the new/updated schema to `./src/db/schema.ts` and then delete the generated `./src/db/auth-schema.ts` file. Make sure to also update the `auth.database.schema` in `./src/auth/utils/index.ts` with the new/updated schema.

After that, run:

```bash
# generate drizzle migrations
bun web db:gen

# run drizzle migrations
bun web db:migrate

# reset auth tables + seed demo + random users (drizzle-seed)
bun web db:seed
```

Demo login: `vaandani@email.com` / `vaandani` (see `src/db/seed-user.ts`).

OpenAPI reference: `https://web.fe-monorepo.localhost/api/auth/reference`
