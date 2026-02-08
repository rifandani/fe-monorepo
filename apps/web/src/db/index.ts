import * as schema from './schema'
import { ENV } from '@/core/constants/env'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

export const dbPool = new Pool({
  connectionString: ENV.DATABASE_URL,
})

export const db = drizzle({
  client: dbPool,
  casing: 'snake_case',
  logger: process.env.NODE_ENV === 'development',
  schema,
})
