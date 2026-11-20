import { describe, expect, it } from "@effect/vitest";
import { fc, test } from "@fast-check/vitest";
import { sessionArb, signedInSessionArb } from "@test/arbitraries";
import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { makePersistence } from "@workspace/core/persistence/persistence";
import type { Persistence } from "@workspace/core/persistence/persistence";
import {
  currentAccessToken,
  endSession,
  Session,
  sessionActivityAtom,
  startSession,
} from "@workspace/core/session/session";
import { SessionRefresh } from "@workspace/core/session/session-refresh";
import { SessionRefreshError } from "@workspace/core/session/session-refresh-error";
import { Deferred, Effect, Fiber, Layer, Option } from "effect";
import { KeyValueStore } from "effect/persistence";

// Helpers

const ada: AuthLoginResponseSchema = {
  accessToken: "access",
  email: "ada@example.com",
  firstName: "Ada",
  gender: "female",
  id: 1,
  image: "https://example.com/ada.png",
  lastName: "Lovelace",
  refreshToken: "refresh",
  username: "ada",
};

/** A Session on `persistence`, whose token refresh is `refresh`. */
const sessionOn = (
  persistence: Pick<Persistence, "registry" | "sessionAtom">,
  refresh: SessionRefresh["Service"],
  options?: Parameters<typeof Session.layer>[1]
) =>
  Session.layer(persistence, options).pipe(
    Layer.provide(Layer.succeed(SessionRefresh, refresh))
  );

/** A Session on in-memory Persistence that records when `onEnd` ran. */
const setup = () => {
  const persistence = makePersistence(KeyValueStore.layerMemory, {
    defaultLocale: () => "en-us",
  });

  const calls: string[] = [];

  const layer = sessionOn(persistence, SessionRefresh.rejecting, {
    onEnd: Effect.sync(() => {
      // The Session is already gone when the app's extra step runs.
      calls.push(
        persistence.registry.get(persistence.sessionAtom) === null
          ? "onEnd after discard"
          : "onEnd before discard"
      );
    }),
  });

  return { calls, layer, persistence };
};

/** In-memory Persistence that holds `session`. */
const persistenceWith = (session: AuthLoginResponseSchema | null) => {
  const persistence = makePersistence(KeyValueStore.layerMemory, {
    defaultLocale: () => "en-us",
  });

  persistence.registry.set(persistence.sessionAtom, session);

  return persistence;
};

/**
 * A server that rotates the token pair on each refresh: the n-th refresh
 * gives `access-n` and `refresh-n`. `calls()` is how many refreshes it served.
 */
const rotatingServer = () => {
  let calls = 0;

  return {
    calls: () => calls,
    refresh: SessionRefresh.of({
      refresh: () =>
        Effect.sync(() => {
          calls += 1;

          return {
            accessToken: `access-${calls}`,
            refreshToken: `refresh-${calls}`,
          };
        }),
    }),
  };
};

/** A server whose refresh fails for `reason`. */
const failingServer = (reason: SessionRefreshError["reason"]) =>
  SessionRefresh.of({
    refresh: () => Effect.fail(new SessionRefreshError({ reason })),
  });

/** Session Refresh for `rejectedToken`, as an Effect for a test. */
const refreshSession = (rejectedToken: string) =>
  Effect.gen(function* () {
    const service = yield* Session;

    return yield* service.refresh(rejectedToken);
  });

describe("Session", () => {
  it.effect("should have no Access Token without a Session", () =>
    Effect.gen(function* () {
      // Arrange
      const { layer } = setup();

      // Act
      const token = yield* currentAccessToken.pipe(Effect.provide(layer));

      // Assert
      expect(Option.isNone(token)).toBe(true);
    })
  );

  it.effect(
    "should start a Session that the atom and the Access Token show",
    () =>
      Effect.gen(function* () {
        // Arrange
        const { layer, persistence } = setup();

        // Act
        const token = yield* startSession(ada).pipe(
          Effect.andThen(currentAccessToken),
          Effect.provide(layer)
        );

        // Assert
        expect(token).toEqual(Option.some("access"));
        expect(persistence.registry.get(persistence.sessionAtom)).toEqual(ada);
      })
  );

  it.effect("should treat an empty Access Token as no Access Token", () =>
    Effect.gen(function* () {
      // Arrange
      const layer = Session.layerMemory({ ...ada, accessToken: "" });

      // Act
      const token = yield* currentAccessToken.pipe(Effect.provide(layer));

      // Assert
      expect(Option.isNone(token)).toBe(true);
    })
  );

  it.effect("should end the Session, then run the app's onEnd step", () =>
    Effect.gen(function* () {
      // Arrange
      const { calls, layer, persistence } = setup();

      // Act
      yield* startSession(ada).pipe(
        Effect.andThen(endSession),
        Effect.provide(layer)
      );

      // Assert
      expect(persistence.registry.get(persistence.sessionAtom)).toBeNull();
      expect(calls).toEqual(["onEnd after discard"]);
    })
  );

  it.effect(
    "should keep the theme and the Locale, which are not the Session",
    () =>
      Effect.gen(function* () {
        // Arrange
        const { layer, persistence } = setup();
        const { registry } = persistence;
        registry.set(persistence.themeAtom, "dark");
        registry.set(persistence.localeAtom, "id-id");

        // Act
        yield* startSession(ada).pipe(
          Effect.andThen(endSession),
          Effect.provide(layer)
        );

        // Assert
        expect(registry.get(persistence.themeAtom)).toBe("dark");
        expect(registry.get(persistence.localeAtom)).toBe("id-id");
      })
  );

  test.prop([signedInSessionArb])(
    "should always read back the Access Token of the Session it started",
    async (session) => {
      // Arrange
      const { layer } = setup();

      // Act
      const token = await Effect.runPromise(
        startSession(session).pipe(
          Effect.andThen(currentAccessToken),
          Effect.provide(layer)
        )
      );

      // Assert
      expect(token).toEqual(Option.some(session.accessToken));
    }
  );

  test.prop([sessionArb])(
    "should never have an Access Token after the Session ends",
    async (session) => {
      // Arrange
      const { layer } = setup();

      // Act
      const token = await Effect.runPromise(
        startSession(session).pipe(
          Effect.andThen(endSession),
          Effect.andThen(currentAccessToken),
          Effect.provide(layer)
        )
      );

      // Assert
      expect(Option.isNone(token)).toBe(true);
    }
  );
});

describe("Session.refresh", () => {
  it.effect(
    "should keep the rotated token pair and give the new Access Token",
    () =>
      Effect.gen(function* () {
        // Arrange
        const persistence = persistenceWith(ada);
        const server = rotatingServer();

        // Act
        const token = yield* refreshSession(ada.accessToken).pipe(
          Effect.provide(sessionOn(persistence, server.refresh))
        );

        // Assert
        expect(token).toEqual(Option.some("access-1"));
        expect(persistence.registry.get(persistence.sessionAtom)).toEqual({
          ...ada,
          accessToken: "access-1",
          refreshToken: "refresh-1",
        });
      })
  );

  it.effect(
    "should end the Session when the server refuses the refresh token",
    () =>
      Effect.gen(function* () {
        // Arrange
        const persistence = persistenceWith(ada);
        let ended = 0;

        const layer = sessionOn(persistence, failingServer("Rejected"), {
          onEnd: Effect.sync(() => {
            ended += 1;
          }),
        });

        // Act
        const token = yield* refreshSession(ada.accessToken).pipe(
          Effect.provide(layer)
        );

        // Assert
        expect(Option.isNone(token)).toBe(true);
        expect(persistence.registry.get(persistence.sessionAtom)).toBeNull();
        expect(ended).toBe(1);
      })
  );

  it.effect("should keep the Session when the refresh cannot finish", () =>
    Effect.gen(function* () {
      // Arrange
      const persistence = persistenceWith(ada);

      // Act
      const token = yield* refreshSession(ada.accessToken).pipe(
        Effect.provide(sessionOn(persistence, failingServer("Failed")))
      );

      // Assert
      expect(Option.isNone(token)).toBe(true);
      expect(persistence.registry.get(persistence.sessionAtom)).toEqual(ada);
    })
  );

  it.effect(
    "should give the current Access Token without a refresh when the rejected one is already replaced",
    () =>
      Effect.gen(function* () {
        // Arrange
        const persistence = persistenceWith(ada);
        const server = rotatingServer();

        // Act
        const token = yield* refreshSession("an-older-token").pipe(
          Effect.provide(sessionOn(persistence, server.refresh))
        );

        // Assert
        expect(token).toEqual(Option.some(ada.accessToken));
        expect(server.calls()).toBe(0);
      })
  );

  it.effect(
    "should let a new login win over a refresh that is still running",
    () =>
      Effect.gen(function* () {
        // Arrange
        const persistence = persistenceWith(ada);

        const grace: AuthLoginResponseSchema = {
          ...ada,
          accessToken: "grace-access",
          firstName: "Grace",
          lastName: "Hopper",
          refreshToken: "grace-refresh",
          username: "grace",
        };

        const started = yield* Deferred.make<true>();
        let interrupted = false;

        // A refresh that runs until the test stops it.
        const slowServer = SessionRefresh.of({
          refresh: () =>
            Deferred.succeed(started, true).pipe(
              Effect.andThen(Effect.never),
              Effect.onInterrupt(() =>
                Effect.sync(() => {
                  interrupted = true;
                })
              )
            ),
        });

        // Act
        const token = yield* Effect.gen(function* () {
          const refreshing = yield* Effect.forkChild(
            refreshSession(ada.accessToken)
          );

          yield* Deferred.await(started);
          yield* startSession(grace);

          return yield* Fiber.join(refreshing);
        }).pipe(Effect.provide(sessionOn(persistence, slowServer)));

        // Assert
        expect(interrupted).toBe(true);
        expect(token).toEqual(Option.some("grace-access"));
        expect(persistence.registry.get(persistence.sessionAtom)).toEqual(
          grace
        );
      })
  );

  it.effect(
    "should show a running refresh in the activity atom, and idle after it",
    () =>
      Effect.gen(function* () {
        // Arrange
        const persistence = persistenceWith(ada);
        const seen: string[] = [];

        const unsubscribe = persistence.registry.subscribe(
          sessionActivityAtom,
          (activity) => {
            seen.push(activity);
          }
        );

        // Act
        yield* refreshSession(ada.accessToken).pipe(
          Effect.provide(sessionOn(persistence, rotatingServer().refresh))
        );
        unsubscribe();

        // Assert
        expect(seen).toEqual(["refreshing", "idle"]);
      })
  );

  test.prop([fc.integer({ min: 1, max: 50 })])(
    "should always serve any number of concurrent rejections with one refresh",
    async (rejections) => {
      // Arrange
      const persistence = persistenceWith(ada);
      const server = rotatingServer();

      // Act
      const tokens = await Effect.runPromise(
        Effect.all(
          Array.from({ length: rejections }, () =>
            refreshSession(ada.accessToken)
          ),
          { concurrency: "unbounded" }
        ).pipe(Effect.provide(sessionOn(persistence, server.refresh)))
      );

      // Assert
      expect(server.calls()).toBe(1);
      expect(tokens).toEqual(
        Array.from({ length: rejections }, () => Option.some("access-1"))
      );
    }
  );
});
