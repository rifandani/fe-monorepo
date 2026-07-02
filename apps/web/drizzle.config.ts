import { defineConfig } from "drizzle-kit";
// config for drizzle-kit
export default defineConfig({
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  dialect: "postgresql",
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
});
