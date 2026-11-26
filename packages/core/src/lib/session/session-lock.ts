import { Effect, Semaphore } from "effect";

export interface SessionLock {
  readonly withLock: <A, E, R>(
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>;
}

export const makeMemorySessionLock = (): SessionLock => {
  const semaphore = Semaphore.makeUnsafe(1);

  return { withLock: semaphore.withPermits(1) };
};

export const makeWebSessionLock = (name: string): SessionLock => {
  const locks = globalThis.navigator?.locks;

  if (locks === undefined) {
    return makeMemorySessionLock();
  }

  return {
    withLock: <A, E, R>(effect: Effect.Effect<A, E, R>) =>
      Effect.flatMap(Effect.context<R>(), (context) =>
        Effect.promise(
          async (signal) =>
            await locks.request(
              name,
              { signal },
              async () =>
                await Effect.runPromiseExitWith(context)(effect, { signal })
            )
        )
      ).pipe(Effect.flatten),
  };
};
