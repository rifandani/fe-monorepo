import type { RawBuilder } from 'kysely'
import { sql } from 'kysely'

export function withTimestamps(qb: any) {
  return qb
    .addColumn('created_at', 'timestamp', (col: any) =>
      col.defaultTo(sql`now()`).notNull())
    .addColumn('updated_at', 'timestamp', (col: any) =>
      col.defaultTo(sql`now()`).notNull())
}

export function softDelete(qb) {
  return qb.addColumn('deleted_at', 'timestamp')
}

export function softDeleteSqlite(qb) {
  return qb.addColumn('deleted_at', 'text')
}

export function withTimestampsSqlite(qb: any) {
  return qb
    .addColumn('created_at', 'text', (col: any) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
    .addColumn('updated_at', 'text', (col: any) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull())
}

export function json<T>(value: T, shouldStringify = false): RawBuilder<T> {
  if (shouldStringify) {
    return sql`CAST(${JSON.stringify(value)} AS JSONB)`
  }

  return sql`CAST(${value} AS JSONB)`
}
