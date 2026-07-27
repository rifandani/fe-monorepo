# Database

- Use `snake_case` for table and column names.
- On schema changes: `bun web db:gen` then `bun web db:migrate`; commit migration files.
- Seed local auth user: `bun web db:seed`.
