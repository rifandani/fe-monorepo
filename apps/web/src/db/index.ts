import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { ENV } from "@/core/constants/env";

import * as schema from "./schema";

export const dbPool = new Pool({
  connectionString: ENV.DATABASE_URL,
});
export const db = drizzle({
  casing: "snake_case",
  client: dbPool,
  logger: process.env.NODE_ENV === "development",
  schema,
});
