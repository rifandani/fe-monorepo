import { Data } from "effect";

export class SessionRefreshError extends Data.TaggedError(
  "SessionRefreshError"
)<{
  readonly reason: "Rejected" | "Failed";
  readonly cause?: unknown;
}> {}
