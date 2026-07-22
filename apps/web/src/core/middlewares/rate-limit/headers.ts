import type { RateLimitInfo } from "./types";

const getResetSeconds = (
  resetTime?: Date,
  windowMs?: number
): number | undefined => {
  let resetSeconds: number | undefined;
  if (resetTime) {
    const deltaSeconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
    resetSeconds = Math.max(0, deltaSeconds);
  } else if (windowMs) {
    // This isn't really correct, but the field is required by the spec in `draft-7`,
    // so this is the best we can do. The validator should have already logged a
    // warning by this point.
    resetSeconds = Math.ceil(windowMs / 1000);
  }
  return resetSeconds;
};
export const setDraft6Headers = (
  headers: Headers,
  info: RateLimitInfo,
  windowMs: number
): void => {
  const windowSeconds = Math.ceil(windowMs / 1000);
  const resetSeconds = getResetSeconds(info.resetTime);
  headers.set("RateLimit-Policy", `${info.limit};w=${windowSeconds}`);
  headers.set("RateLimit-Limit", info.limit.toString());
  headers.set("RateLimit-Remaining", info.remaining.toString());
  // Set this header only if the store returns a `resetTime`.
  if (resetSeconds) {
    headers.set("RateLimit-Reset", resetSeconds.toString());
  }
};
export const setDraft7Headers = (
  headers: Headers,
  info: RateLimitInfo,
  windowMs: number
): void => {
  const windowSeconds = Math.ceil(windowMs / 1000);
  const resetSeconds = getResetSeconds(info.resetTime, windowMs);
  headers.set("RateLimit-Policy", `${info.limit};w=${windowSeconds}`);
  headers.set(
    "RateLimit",
    `limit=${info.limit}, remaining=${info.remaining}, reset=${resetSeconds}`
  );
};
export const setRetryAfterHeader = (
  headers: Headers,
  info: RateLimitInfo,
  windowMs: number
): void => {
  const resetSeconds = getResetSeconds(info.resetTime, windowMs);
  if (resetSeconds) {
    headers.set("Retry-After", resetSeconds.toString());
  }
};
