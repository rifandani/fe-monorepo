# Database

- **RDBMS**: postgres@17
- **ORM**: drizzle
- **Driver**: node-postgres
- **Config**: `./drizzle.config.ts`
- **Entry**: `./src/db/index.ts`
- **Migrations**: `./src/db/migrations`

Conventions:

- Use `snake_case` for table and column names.
- On schema changes: `bun hono db:gen` then `bun web db:migrate`; commit migration files.

## Migrations

**Push** (code-first, apply directly; good for local iteration):

```bash
bun web db:push
```

**Generate + migrate**:

```bash
bun web db:gen
bun web db:migrate
```

**Pull** (database-first; introspect existing DB into `schema.ts`):

```bash
bun web db:pull
```

## Seeding

Coming soon.
