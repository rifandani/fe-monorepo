/* oxlint-disable sonarjs/no-duplicate-string */
import { eq, sql } from "drizzle-orm";

import { errorAttributesFromUnknown } from "@/core/utils/error-helper";
import { log } from "@/core/utils/evlog";
import { db } from "@/db/index";
import { rateLimitTable } from "@/db/schema";

import type { ClientRateLimitInfo, ConfigType, Store } from "./types";
import "server-only";
/**
 * A `Store` that stores the hit count for each client in a PostgreSQL database.
 *
 * @public
 */
export class DbStore<P extends string = string> implements Store<P> {
  /**
   * The duration of time before which all hit counts are reset (in milliseconds).
   */
  #windowMs!: number;
  /**
   * Method that initializes the store.
   *
   * @param options {ConfigType} - The options used to setup the middleware.
   */
  init(options: ConfigType<P>): void {
    // Get the duration of a window from the options.
    this.#windowMs = options.windowMs;
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
        .limit(1);
      if (result.length === 0) {
        return;
      }
      const [record] = result;
      if (!record) {
        return;
      }
      const now = Date.now();
      const windowStart = now - this.#windowMs;
      // Check if the record is expired (outside the current window)
      if (record.lastRequest && record.lastRequest < windowStart) {
        // Record is expired, delete it and return undefined
        await db.delete(rateLimitTable).where(eq(rateLimitTable.key, key));
        return;
      }
      const resetTime = new Date(
        now + this.#windowMs - (now - (record.lastRequest || now))
      );
      return {
        resetTime,
        totalHits: record.count || 0,
      };
    } catch (error) {
      log.error({
        area: "rateLimit.dbStore",
        operation: "get",
        summary: "Error getting rate limit record",
        ...errorAttributesFromUnknown(error),
        failOpen: true,
      });
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
    const now = Date.now();
    const windowStart = now - this.#windowMs;
    try {
      // First, try to get existing record
      const existing = await db
        .select()
        .from(rateLimitTable)
        .where(eq(rateLimitTable.key, key))
        .limit(1);
      if (existing.length > 0) {
        const [record] = existing;
        if (!record) {
          return {
            resetTime: new Date(now + this.#windowMs),
            totalHits: 1,
          };
        }
        // Check if window expired
        const isExpired = record.lastRequest < windowStart;
        const newCount = isExpired ? 1 : (record.count || 0) + 1;
        // Update existing record
        const updated = await db
          .update(rateLimitTable)
          .set({
            count: newCount,
            lastRequest: now,
          })
          .where(eq(rateLimitTable.key, key))
          .returning();
        return {
          resetTime: new Date(now + this.#windowMs),
          totalHits: updated[0]?.count || 1,
        };
      }
      // Create new record (UUID will be auto-generated)
      const inserted = await db
        .insert(rateLimitTable)
        .values({
          count: 1,
          key,
          lastRequest: now,
        })
        .returning();
      return {
        resetTime: new Date(now + this.#windowMs),
        totalHits: inserted[0]?.count || 1,
      };
    } catch (error) {
      log.error({
        area: "rateLimit.dbStore",
        operation: "increment",
        summary: "Error incrementing rate limit",
        ...errorAttributesFromUnknown(error),
        failOpen: true,
      });
      // Fallback: return a conservative estimate
      return {
        resetTime: new Date(now + this.#windowMs),
        totalHits: 1,
      };
    }
  }
  /**
   * Method to decrement a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @public
   */
  // oxlint-disable-next-line class-methods-use-this
  async decrement(key: string): Promise<void> {
    try {
      const now = Date.now();
      await db
        .update(rateLimitTable)
        .set({
          count: sql`GREATEST(0, ${rateLimitTable.count} - 1)`, // prevent negative counts
          lastRequest: now,
        })
        .where(eq(rateLimitTable.key, key));
    } catch (error) {
      log.error({
        area: "rateLimit.dbStore",
        operation: "decrement",
        summary: "Error decrementing rate limit",
        ...errorAttributesFromUnknown(error),
      });
    }
  }
  /**
   * Method to reset a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @public
   */
  // oxlint-disable-next-line class-methods-use-this
  async resetKey(key: string): Promise<void> {
    try {
      await db.delete(rateLimitTable).where(eq(rateLimitTable.key, key));
    } catch (error) {
      log.error({
        area: "rateLimit.dbStore",
        operation: "resetKey",
        summary: "Error resetting rate limit key",
        ...errorAttributesFromUnknown(error),
      });
    }
  }
  /**
   * Method to reset everyone's hit counter.
   *
   * @public
   */
  // oxlint-disable-next-line class-methods-use-this
  async resetAll(): Promise<void> {
    try {
      await db.delete(rateLimitTable);
    } catch (error) {
      log.error({
        area: "rateLimit.dbStore",
        operation: "resetAll",
        summary: "Error resetting all rate limits",
        ...errorAttributesFromUnknown(error),
      });
    }
  }
  /**
   * Method to stop the timer (if currently running) and prevent any memory
   * leaks. For DbStore, this is mostly a no-op but included for interface compatibility.
   *
   * @public
   */
  // oxlint-disable-next-line class-methods-use-this
  shutdown(): void {
    // No cleanup needed for database store
  }
}
