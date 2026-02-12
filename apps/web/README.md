# @workspace/web

## 🎯 Todo

- [ ] sitemap still does not work when we run `bun web build`. That's why we rename it into `sitemap.txt`.
- [ ] fix e2e tests
- [ ] install orpc (no agent skills yet)
- [ ] consider using `@tanstack/react-form` instead of `react-hook-form` (`next-safe-action` still does not support `@tanstack/react-form`)
- [ ] instrumentation using vercel otel
- [ ] drizzle beta

## 🗃️ Database

We use `postgres@17` as RDBMS, `drizzle` as ORM, and `node-postgres` as driver.

Config file for drizzle-kit is in `./drizzle.config.ts`. Entry file for drizzle-orm is in `./src/db/index.ts`. Migration files are in `./src/db/migrations` folder.

Follow below conventions:

- use `snake_case` for table and column names
- for every changes in database schema, create a new migration by running `bun hono db:gen` and apply it by running `bun web db:migrate`
- commit migration files to git

### Database Migrations

You can directly apply changes to your database using the drizzle-kit push command. This is a convenient method for quickly testing new schema designs or modifications in a local development environment, allowing for rapid iterations without the need to manage migration files. This is designed to cover code first approach of Drizzle migrations.

```bash
# directly apply changes to your database
bun web db:push
```

Alternatively, you can generate the migrations first, then run the migrations.

```bash
# generate the migrations
bun web db:gen

# run the migrations
bun web db:migrate
```

We could also pull(introspect) our existing database schema and generate `schema.ts` drizzle schema file from it. This is designed to cover database first approach of Drizzle migrations. This is a great approach if we need to manage database schema outside of our TypeScript project or we're using database, which is managed by somebody else.

```bash
# pull the latest schema from the database
bun web db:pull
```

### Database Seeding

Coming Soon

### Database Studio

```bash
# run the drizzle studio at https://local.drizzle.studio?port=3003
bun web db:studio
```

## 🔐 Auth

We use `better-auth` for authentication.

```bash
# everytime we add/remove/change auth schema, generate the new auth schema
bun hono auth:gen

# generate drizzle migrations
bun hono db:gen

# run drizzle migrations
bun hono db:migrate
```

To see the openapi reference, visit `http://localhost:3002/api/auth/reference`.
