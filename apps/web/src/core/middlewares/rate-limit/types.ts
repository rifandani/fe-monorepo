import type { StatusCode } from '@workspace/core/constants/http'
import type { NextRequest } from 'next/server'

/**
 * Data returned from the `Store` when a client's hit counter is incremented.
 *
 * @property totalHits {number} - The number of hits for that client so far.
 * @property resetTime {Date | undefined} - The time when the counter resets.
 */
export interface ClientRateLimitInfo {
  totalHits: number
  resetTime?: Date
}

/**
 * Promisify<T> is a utility type that represents a value of type T or a Promise<T>.
 * This type is useful for converting synchronous functions to asynchronous functions.
 * @example
 *   type getResult = Promisify<number>;  // getResult can be number or Promise<number>
 *   type getUser = Promisify<User>;      // getUser can be User or Promise<User>
 */
export type Promisify<T> = T | Promise<T>

/**
 * The rate limit related information for each client included in the Hono context object.
 */
export interface RateLimitInfo {
  limit: number
  used: number
  remaining: number
  resetTime: Date | undefined
}

export interface EventParamsContext<
  P extends string = string,
> {
  context: Map<string, any>
  options: ConfigType<P>
  headers: Headers
}

/**
 * Next.js request handler that sends back a response when a client is
 * rate-limited.
 *
 * @param optionsUsed {ConfigType} - The options used to set up the middleware.
 */
export type RateLimitExceededEventHandler<
  P extends string = string,
> = ({ context, options, headers }: EventParamsContext<P>) => void

/**
 * The configuration options for the rate limiter.
 */
export interface ConfigType<
  P extends string = string,
> {
  /**
   * How long we should remember the requests.
   *
   * Defaults to `60000` ms (= 1 minute).
   */
  windowMs: number

  /**
   * The maximum number of connections to allow during the `window` before
   * rate limiting the client.
   *
   * Can be the limit itself as a number or express middleware that parses
   * the request and then figures out the limit.
   *
   * Defaults to `5`.
   */
  limit: number | ((context: Map<string, any>) => Promisify<number>)

  /**
   * The response body to send back when a client is rate limited.
   *
   * Defaults to `'Too many requests, please try again later.'`
   */
  message:
    | string
    | Record<string, unknown>

  /**
   * The HTTP status code to send back when a client is rate limited.
   *
   * Defaults to `HTTP 429 Too Many Requests` (RFC 6585).
   */
  statusCode: StatusCode

  /**
   * Whether to enable support for the standardized rate limit headers (`RateLimit-*`).
   *
   * Defaults to `draft-6`.
   */
  standardHeaders: boolean | 'draft-6' | 'draft-7'

  /**
   * The name of the property on the context object to store the rate limit info.
   *
   * Defaults to `rateLimit`.
   */
  requestPropertyName: string

  /**
   * The name of the property on the context object to store the Data Store instance.
   *
   * Defaults to `rateLimitStore`.
   */
  requestStorePropertyName: string

  /**
   * Method to generate custom identifiers for clients.
   */
  keyGenerator: (params: { context: Map<string, any>, request: NextRequest }) => Promisify<string>

  /**
   * Hono request handler that sends back a response when a client is
   * rate-limited.
   *
   * By default, sends back the `statusCode` and `message` set via the options.
   */
  handler: RateLimitExceededEventHandler<P>

  /**
   * The `Store` to use to store the hit count for each client.
   *
   * By default, the built-in `MemoryStore` will be used.
   */
  store: Store
}

/**
 * An interface that all hit counter stores must implement.
 */
export interface Store<
  P extends string = string,
> {
  /**
   * Method that initializes the store, and has access to the options passed to
   * the middleware too.
   *
   * @param options {ConfigType} - The options used to setup the middleware.
   */
  init?: (options: ConfigType<P>) => void

  /**
   * Method to fetch a client's hit count and reset time.
   *
   * @param key {string} - The identifier for a client.
   *
   * @returns {ClientRateLimitInfo} - The number of hits and reset time for that client.
   */
  get?: (key: string) => Promisify<ClientRateLimitInfo | undefined>

  /**
   * Method to increment a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   *
   * @returns {ClientRateLimitInfo | undefined} - The number of hits and reset time for that client.
   */
  increment: (key: string) => Promisify<ClientRateLimitInfo>

  /**
   * Method to decrement a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   */
  decrement: (key: string) => Promisify<void>

  /**
   * Method to reset a client's hit counter.
   *
   * @param key {string} - The identifier for a client.
   */
  resetKey: (key: string) => Promisify<void>

  /**
   * Method to reset everyone's hit counter.
   */
  resetAll?: () => Promisify<void>

  /**
   * Method to shutdown the store, stop timers, and release all resources.
   */
  shutdown?: () => Promisify<void>

  /**
   * Flag to indicate that keys incremented in one instance of this store can
   * not affect other instances. Typically false if a database is used, true for
   * MemoryStore.
   *
   * Used to help detect double-counting misconfigurations.
   */
  localKeys?: boolean

  /**
   * Optional value that the store prepends to keys
   *
   * Used by the double-count check to avoid false-positives when a key is counted twice, but with different prefixes
   */
  prefix?: string
}

export type GeneralConfigType<T extends { keyGenerator: unknown }> = Pick<
  T,
  'keyGenerator'
>
& Partial<Omit<T, 'keyGenerator'>>
