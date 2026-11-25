import { setImmediate as nextMacrotask } from "node:timers/promises";

import { describe, expect, it } from "@effect/vitest";
import {
  makeMemorySessionLock,
  makeWebSessionLock,
} from "@workspace/core/session/session-lock";
import type { SessionLock } from "@workspace/core/session/session-lock";
import { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { Context, Deferred, Effect, Fiber } from "effect";

class Greeting extends Context.Service<Greeting, string>()("test/Greeting") {}

let lockNames = 0;

const uniqueWebLock = () => {
  lockNames += 1;

  return makeWebSessionLock(`session-lock-test-${String(lockNames)}`);
};

const lockFactories: readonly (readonly [string, () => SessionLock])[] = [
  ["makeWebSessionLock", uniqueWebLock],
  ["makeMemorySessionLock", makeMemorySessionLock],
];

const settle = Effect.promise(async () => {
  await nextMacrotask();
  await nextMacrotask();
});

const record = (log: string[], entry: string) =>
  Effect.sync(() => {
    log.push(entry);
  });

const holdLock = (lock: SessionLock, log: string[]) =>
  Effect.gen(function* () {
    const started = yield* Deferred.make<boolean>();
    const gate = yield* Deferred.make<boolean>();

    const first = yield* Effect.forkChild(
      lock.withLock(
        record(log, "first").pipe(
          Effect.andThen(Deferred.succeed(started, true)),
          Effect.andThen(Deferred.await(gate))
        )
      )
    );

    yield* Deferred.await(started);

    return { first, gate };
  });

describe("makeWebSessionLock with one name", () => {
  it.effect("should hold the named Web Lock while the effect runs", () =>
    Effect.gen(function* () {
      const name = "session-lock-test-held";

      const held = yield* makeWebSessionLock(name).withLock(
        Effect.promise(async () => await navigator.locks.query())
      );

      expect(held.held?.map((lock) => lock.name)).toContain(name);
    })
  );

  it.effect(
    "should make a second Session Lock with the same name wait, as a second tab does",
    () =>
      Effect.gen(function* () {
        const name = "session-lock-test-tabs";
        const log: string[] = [];
        const { first, gate } = yield* holdLock(makeWebSessionLock(name), log);

        const second = yield* Effect.forkChild(
          makeWebSessionLock(name).withLock(record(log, "second"))
        );

        yield* settle;
        log.push("gate opens");
        yield* Deferred.succeed(gate, true);
        yield* Fiber.join(first);
        yield* Fiber.join(second);

        expect(log).toEqual(["first", "gate opens", "second"]);
      })
  );
});

for (const [name, makeLock] of lockFactories) {
  describe(name, () => {
    it.effect("should return what the effect returns", () =>
      Effect.gen(function* () {
        const lock = makeLock();

        const value = yield* lock.withLock(Effect.succeed("tokens"));

        expect(value).toBe("tokens");
      })
    );

    it.effect("should fail with the error of the effect", () =>
      Effect.gen(function* () {
        const lock = makeLock();

        const error = yield* lock
          .withLock(
            Effect.fail(new SessionRefreshError({ reason: "Rejected" }))
          )
          .pipe(Effect.flip);

        expect(error).toEqual(new SessionRefreshError({ reason: "Rejected" }));
      })
    );

    it.effect("should give the effect the services of the caller", () =>
      Effect.gen(function* () {
        const lock = makeLock();

        const greeting = yield* lock
          .withLock(Effect.service(Greeting))
          .pipe(Effect.provideService(Greeting, "hello"));

        expect(greeting).toBe("hello");
      })
    );

    it.effect(
      "should start a second effect only after the first one ends",
      () =>
        Effect.gen(function* () {
          const lock = makeLock();
          const log: string[] = [];
          const { first, gate } = yield* holdLock(lock, log);

          const second = yield* Effect.forkChild(
            lock.withLock(record(log, "second"))
          );

          yield* settle;
          log.push("gate opens");
          yield* Deferred.succeed(gate, true);
          yield* Fiber.join(first);
          yield* Fiber.join(second);

          expect(log).toEqual(["first", "gate opens", "second"]);
        })
    );

    it.effect("should release the lock when the holder is interrupted", () =>
      Effect.gen(function* () {
        const lock = makeLock();
        const log: string[] = [];
        const { first } = yield* holdLock(lock, log);

        yield* Fiber.interrupt(first);
        yield* lock.withLock(record(log, "second"));

        expect(log).toEqual(["first", "second"]);
      })
    );

    it.effect("should never run a waiting effect that was interrupted", () =>
      Effect.gen(function* () {
        const lock = makeLock();
        const log: string[] = [];
        const { first, gate } = yield* holdLock(lock, log);

        const waiting = yield* Effect.forkChild(
          lock.withLock(record(log, "interrupted"))
        );

        yield* settle;

        yield* Fiber.interrupt(waiting);
        yield* Deferred.succeed(gate, true);
        yield* Fiber.join(first);
        yield* lock.withLock(record(log, "third"));

        expect(log).toEqual(["first", "third"]);
      })
    );
  });
}
