import type { z } from 'zod'
import {
  boolean,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { createSelectSchema } from 'drizzle-zod'

// #region COMMON
const timestamps = {
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp(),
  deletedAt: timestamp(),
}
// #endregion COMMON

// #region AUTH
export const userTable = pgTable('user', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().default(false).notNull(),
  image: text(),
  ...timestamps,
})
export const selectUserTableSchema = createSelectSchema(userTable)
export type UserTable = z.infer<typeof selectUserTableSchema>

export const sessionTable = pgTable('session', {
  id: text().primaryKey(),
  expiresAt: timestamp().notNull(),
  token: text().notNull().unique(),
  ipAddress: text(),
  userAgent: text(),
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  ...timestamps,
})
export const selectSessionTableSchema = createSelectSchema(sessionTable)
export type SessionTable = z.infer<typeof selectSessionTableSchema>

export const accountTable = pgTable('account', {
  id: text().primaryKey(),
  accountId: text().notNull(),
  providerId: text().notNull(),
  userId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  accessToken: text(),
  refreshToken: text(),
  idToken: text(),
  accessTokenExpiresAt: timestamp(),
  refreshTokenExpiresAt: timestamp(),
  scope: text(),
  password: text(),
  ...timestamps,
})
export const selectAccountTableSchema = createSelectSchema(accountTable)
export type AccountTable = z.infer<typeof selectAccountTableSchema>

export const verificationTable = pgTable('verification', {
  id: text().primaryKey(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp().notNull(),
  ...timestamps,
})
export const selectVerificationTableSchema
  = createSelectSchema(verificationTable)
export type VerificationTable = z.infer<typeof selectVerificationTableSchema>
// #endregion AUTH
