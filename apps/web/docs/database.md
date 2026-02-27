# Database

- Use `snake_case` for table and column names.
- On schema changes: `bun hono db:gen` then `bun web db:migrate`; commit migration files.
