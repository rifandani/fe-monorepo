/**
 * Deterministic credentials used by `db:seed` and Playwright auth flows.
 */
export const SEED_USER = {
  email: "vaandani@email.com",
  name: "vaandani",
  password: "vaandani",
} as const;

/** Shared password for randomly generated seed users (not the e2e demo user). */
export const SEED_BULK_PASSWORD = "password123" as const;
