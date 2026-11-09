import { describe, expect, it } from "@effect/vitest";
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

const session: AuthLoginResponseSchema = {
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
  it.effect("has no Access Token without a Session", () =>
    Effect.gen(function* () {
      const { layer } = setup();

      const token = yield* currentAccessToken.pipe(Effect.provide(layer));

      expect(Option.isNone(token)).toBe(true);
    })
  );

  it.effect("starts a Session that the atom and the Access Token show", () =>
    Effect.gen(function* () {
      const { layer, persistence } = setup();

      const token = yield* startSession(session).pipe(
        Effect.andThen(currentAccessToken),
        Effect.provide(layer)
      );

      expect(token).toEqual(Option.some("access"));
      expect(persistence.registry.get(persistence.sessionAtom)).toEqual(
        session
      );
    })
  );

  it.effect("treats an empty Access Token as no Access Token", () =>
    Effect.gen(function* () {
      const token = yield* currentAccessToken.pipe(
        Effect.provide(Session.layerMemory({ ...session, accessToken: "" }))
      );

      expect(Option.isNone(token)).toBe(true);
    })
  );

  it.effect("ends the Session, then runs the app's onEnd step", () =>
    Effect.gen(function* () {
      const { calls, layer, persistence } = setup();

      yield* startSession(session).pipe(
        Effect.andThen(endSession),
        Effect.provide(layer)
      );

      expect(persistence.registry.get(persistence.sessionAtom)).toBeNull();
      expect(calls).toEqual(["onEnd after discard"]);
    })
  );

  it.effect("keeps the theme and the Locale, which are not the Session", () =>
    Effect.gen(function* () {
      const { layer, persistence } = setup();
      const { registry } = persistence;
      registry.set(persistence.themeAtom, "dark");
      registry.set(persistence.localeAtom, "id-id");

      yield* startSession(session).pipe(
        Effect.andThen(endSession),
        Effect.provide(layer)
      );

      expect(registry.get(persistence.themeAtom)).toBe("dark");
      expect(registry.get(persistence.localeAtom)).toBe("id-id");
    })
  );
});
