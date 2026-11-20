import { Data } from "effect";

/**
 * @description A token refresh that gave no new token pair.
 *
 * - `Rejected`: the server refused the refresh token, so the Session cannot
 *   continue. Session Refresh ends the Session on this reason only.
 * - `Failed`: the refresh did not finish (network, timeout, a 5xx, a response
 *   that breaks the schema). Nothing says the Session is invalid, so Session
 *   Refresh keeps it, and the request that started the refresh fails.
 */
export class SessionRefreshError extends Data.TaggedError(
  "SessionRefreshError"
)<{
  readonly reason: "Rejected" | "Failed";
  readonly cause?: unknown;
}> {}
