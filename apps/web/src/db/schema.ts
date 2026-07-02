import {
  bigint,
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
// #region COMMON
const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  deletedAt: timestamp(),
  updatedAt: timestamp(),
};
// #endregion COMMON
// #region AUTH
export const userTable = pgTable("user", {
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  id: text().primaryKey(),
  image: text(),
  name: text().notNull(),
  ...timestamps,
});
export const selectUserTableSchema = createSelectSchema(userTable);
export type UserTable = z.infer<typeof selectUserTableSchema>;
export const sessionTable = pgTable("session", {
  expiresAt: timestamp().notNull(),
  id: text().primaryKey(),
  ipAddress: text(),
  token: text().notNull().unique(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  ...timestamps,
});
export const selectSessionTableSchema = createSelectSchema(sessionTable);
export type SessionTable = z.infer<typeof selectSessionTableSchema>;
export const accountTable = pgTable("account", {
  accessToken: text(),
  accessTokenExpiresAt: timestamp(),
  accountId: text().notNull(),
  id: text().primaryKey(),
  idToken: text(),
  password: text(),
  providerId: text().notNull(),
  refreshToken: text(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  ...timestamps,
});
export const selectAccountTableSchema = createSelectSchema(accountTable);
export type AccountTable = z.infer<typeof selectAccountTableSchema>;
export const verificationTable = pgTable("verification", {
  expiresAt: timestamp().notNull(),
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  ...timestamps,
});
export const selectVerificationTableSchema =
  createSelectSchema(verificationTable);
export type VerificationTable = z.infer<typeof selectVerificationTableSchema>;
// #endregion AUTH
// #region RATE LIMIT
export const rateLimitTable = pgTable("rate_limit", {
  // number of requests in current window
  count: integer("count").default(0).notNull(),
  id: uuid("id").defaultRandom().primaryKey(),
  // unique identifier for each rate limit key
  key: text("key").notNull().unique(),
  // timestamp of last request
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});
// #endregion RATE LIMIT
