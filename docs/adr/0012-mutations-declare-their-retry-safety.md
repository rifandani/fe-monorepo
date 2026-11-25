# Mutations declare their retry safety

> Recorded on 2026-11-25. Builds on [ADR-0006](./0006-core-owns-the-effect-seams.md) (core owns `Http` and the option factories).

`Http` stops waiting after 10 s. A timeout does not prove that the server did not do the work. If TanStack Query retries the mutation, or a person sends it again, the server can do the work two times. A lint rule cannot know if a server endpoint is idempotent, so each mutation states it.

## Vocabulary

**Retry Safety**: The statement that a mutation is `"idempotent"` (sending it again has the same effect as sending it once) or `"not-idempotent"`. It is in the mutation `meta` as `retrySafety`. _Avoid_: retryable, safe mutation

**Unknown Outcome**: A timeout of a not-idempotent mutation. The server possibly did the work. _Avoid_: failed, lost request

## Decisions

- **Each mutation option factory in core spreads one Retry Safety preset.** The presets are in `@workspace/core/http/retry-safety`: `idempotentMutation` and `notIdempotentMutation`. Spread the preset first, so a factory can see what it declares.
- **A not-idempotent mutation has `retry: 0`.** `notIdempotentMutation` sets it. A mutation that must retry sends an idempotency key that the server accepts, and then it declares `idempotentMutation`.
- **An idempotent mutation keeps the client retry policy.** `idempotentMutation` sets only `meta`.
- **App hooks do not override `retry` or `meta`.** A hook that wraps a core factory removes `retry` and `meta` from its option type, as it does for `mutationKey` and `mutationFn`.
- **The UI shows the Unknown Outcome.** The `onError` of the hook uses `toMutationErrorMessage(error, options.meta)`. For a timeout (`Cause.TimeoutError`) of a not-idempotent mutation, it gives `unknownOutcomeMessage`, which tells the person to check the result before they try again. For all other errors, it gives `toErrorMessage(error)`.
- **Current declarations.** `authLoginMutationOptions` is not idempotent: each login starts a new Session. `cdnFileMutationOptions` is idempotent: it is a GET.

## Considered Options

- **A lint rule** — rejected. The rule sees the client code, not the server behavior.
- **`retry: 0` for all mutations, with no declaration** — rejected. It removes safe retries, and the UI cannot know which timeouts have an Unknown Outcome.
- **Retry Safety from the HTTP method** — rejected. A POST can be idempotent with an idempotency key, and a PUT on some servers is not.

## Consequences

- A new mutation factory with no preset is a review finding.
- `queries.unit.test.ts` for auth proves that a client with `mutations.retry: 3` sends the login one time, and that a login timeout is an Unknown Outcome.
