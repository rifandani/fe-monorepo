import type {
  ClientRateLimitInfo,
  ConfigType,
  Store,
} from './types'
import { db } from '@/db/index'
import { rateLimitTable } from '@/db/schema'
import { logger } from '@workspace/core/utils/logger'
import { eq, sql } from 'drizzle-orm'

/**
 * A `Store` that stores the hit count for each client in a PostgreSQL database.
 *
 * @public
 */
export class DbStore<P extends string = string> implements Store<P> {
  /**
   * The duration of time before which all hit counts are reset (in milliseconds).
   */
  #windowMs!: number

  /**
   * Method that initializes the store.
   *
   * @param options {ConfigType} - The options used to setup the middleware.
   */
  init(options: ConfigType<P>): void {
    // Get the duration of a window from the options.
    this.#windowMs = options.windowMs
  }

  /**
   * Method to fetch a client's hit count and reset time.
   *
   * @param key {string} - The identifier for a client.
   *
   * @returns {ClientRateLimitInfo | undefined} - The number of hits and reset time for that client.
   *
   * @public
   */
  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    try {
      const result = await db
        .select()
        .from(rateLimitTable)
        .where(eq(rateLimitTable.key, key))
        .limit(1)

      if (result.length === 0) {
        return
      }

      const record = result[0]!
      const now = Date.now()
      const windowStart = now - this.#windowMs

      // Check if the record is expired (outside the current window)
      if (record.lastRequest && record.lastRequest < windowStart) {
        // Record is expired, delete it and return undefined
        await db.delete(rateLimitTable).where(eq(rateLimitTable.key, key))
        return
      }

      const resetTime = new Date(
        now + this.#windowMs - (now - (record.lastRequest || now)),
      )

      return {
        totalHits: record.count || 0,
        resetTime,
      }
    }
    catch (error) {
      logger.error('Error getting rate limit record:', error)
    }
  }

  /**
   * Method to increment a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @returns {ClientRateLimitInfo} - The number of hits and reset time for that client.
   *
   * @public
   */
  async increment(key: string): Promise<ClientRateLimitInfo> {
    const now = Date.now()
    const windowStart = now - this.#windowMs

    try {
      // First, try to get existing record
      const existing = await db
        .select()
        .from(rateLimitTable)
        .where(eq(rateLimitTable.key, key))
        .limit(1)

      if (existing.length > 0) {
        const record = existing[0]!
        // Check if window expired
        const isExpired = record.lastRequest < windowStart
        const newCount = isExpired ? 1 : (record.count || 0) + 1

        // Update existing record
        const updated = await db
          .update(rateLimitTable)
          .set({
            count: newCount,
            lastRequest: now,
          })
          .where(eq(rateLimitTable.key, key))
          .returning()

        return {
          totalHits: updated[0]!.count || 1,
          resetTime: new Date(now + this.#windowMs),
        }
      }

      // Create new record (UUID will be auto-generated)
      const inserted = await db
        .insert(rateLimitTable)
        .values({
          key,
          count: 1,
          lastRequest: now,
        })
        .returning()

      return {
        totalHits: inserted[0]!.count || 1,
        resetTime: new Date(now + this.#windowMs),
      }
    }
    catch (error) {
      logger.error('Error incrementing rate limit:', error)
      // Fallback: return a conservative estimate
      return {
        totalHits: 1,
        resetTime: new Date(now + this.#windowMs),
      }
    }
  }

  /**
   * Method to decrement a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @public
   */
  async decrement(key: string): Promise<void> {
    try {
      const now = Date.now()
      await db
        .update(rateLimitTable)
        .set({
          count: sql`GREATEST(0, ${rateLimitTable.count} - 1)`, // prevent negative counts
          lastRequest: now,
        })
        .where(eq(rateLimitTable.key, key))
    }
    catch (error) {
      logger.error('Error decrementing rate limit:', error)
    }
  }

  /**
   * Method to reset a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @public
   */
  async resetKey(key: string): Promise<void> {
    try {
      await db.delete(rateLimitTable).where(eq(rateLimitTable.key, key))
    }
    catch (error) {
      logger.error('Error resetting rate limit key:', error)
    }
  }

  /**
   * Method to reset everyone's hit counter.
   *
   * @public
   */
  async resetAll(): Promise<void> {
    try {
      await db.delete(rateLimitTable)
    }
    catch (error) {
      logger.error('Error resetting all rate limits:', error)
    }
  }

  /**
   * Method to stop the timer (if currently running) and prevent any memory
   * leaks. For DbStore, this is mostly a no-op but included for interface compatibility.
   *
   * @public
   */
  shutdown(): void {
    // No cleanup needed for database store
  }
}
