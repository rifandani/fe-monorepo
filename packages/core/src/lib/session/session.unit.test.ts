import { describe, expect, it } from "@effect/vitest";
import { test } from "@fast-check/vitest";
import { sessionArb, signedInSessionArb } from "@test/arbitraries";
import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { makePersistence } from "@workspace/core/persistence/persistence";
import {
  currentAccessToken,
  endSession,
  Session,
  startSession,
} from "@workspace/core/session/session";
import { Effect, Option } from "effect";
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

/** A Session on in-memory Persistence that records when `onEnd` ran. */
const setup = () => {
  const persistence = makePersistence(KeyValueStore.layerMemory, {
    defaultLocale: () => "en-us",
  });

  const calls: string[] = [];

  const layer = Session.layer(persistence, {
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
