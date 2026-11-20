import { setTimeout as sleep } from "node:timers/promises";

import { fc, test } from "@fast-check/vitest";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { makePersistence } from "@workspace/core/persistence/persistence";
import {
  endSession,
  Session,
  startSession,
} from "@workspace/core/session/session";
import { Effect, Schema } from "effect";
import { KeyValueStore } from "effect/persistence";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createSessionGate,
  loginSearchSchema,
} from "@/app/providers/router/session-gate";

vi.mock("sonner", () => ({ toast: { error: vi.fn(), info: vi.fn() } }));

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

/**
 * A real router on in-memory history, with the two guarded routes of the app,
 * and the real Session flows (`startSession`, `endSession`) on in-memory
 * Persistence. Nothing renders: the router loads and redirects by itself.
 */
const setup = async (initialEntry: string, signedIn = false) => {
  const persistence = makePersistence(KeyValueStore.layerMemory, {
    defaultLocale: () => "en-us",
  });

  const session = Session.layer(persistence);

  const run = async <A>(effect: Effect.Effect<A, never, Session>) =>
    await Effect.runPromise(effect.pipe(Effect.provide(session)));

  if (signedIn) {
    await run(startSession(ada));
  }

  const gate = createSessionGate(persistence);
  const rootRoute = createRootRoute();

  const homeRoute = createRoute({
    beforeLoad: gate.requireSession,
    getParentRoute: () => rootRoute,
    path: "/",
  });

  const loginRoute = createRoute({
    beforeLoad: gate.requireNoSession,
    getParentRoute: () => rootRoute,
    path: "/login",
    validateSearch: Schema.toStandardSchemaV1(loginSearchSchema),
  });

  const router = createRouter({
    // Node reads as a server, where the router returns a redirect and does not follow it.
    isServer: false,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
    routeTree: rootRoute.addChildren([homeRoute, loginRoute]),
  });

  await router.load();

  return {
    gate,
    href: () => router.history.location.href,
    router,
    signIn: async () => {
      await run(startSession(ada));
    },
    signOut: async () => {
      await run(endSession);
    },
  };
};

const decode = Schema.decodeUnknownSync(loginSearchSchema);

/** An origin the schema never sees, to check where a kept redirect resolves. */
const appOrigin = "https://app.example";

/** Strings shaped like the open-redirect tricks: other hosts, `//`, `\\`, tabs. */
const craftedRedirectArb = fc
  .tuple(
    fc.constantFrom(
      "/",
      "//",
      "/\\",
      "\\",
      "/\t/",
      "/\n/",
      " /",
      "https:",
      // Built from parts: lint rejects a literal script URL.
      ["java", "script:"].join("")
    ),
    fc.oneof(fc.string(), fc.domain(), fc.webUrl())
  )
  .map(([prefix, rest]) => `${prefix}${rest}`);

const redirectCandidateArb = fc.oneof(
  fc.string(),
  fc.webUrl(),
  craftedRedirectArb
);

/**
 * A path of this app other than the login: `/` and segments that each start
 * with `s`, so none is `.`, `..`, empty or `login`.
 */
const appPathArb = fc
  .array(fc.webSegment().map((segment) => `s${segment}`))
  .map((segments) => `/${segments.join("/")}`);

describe("requireSession", () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
  });

  it("should let a signed-in person open the page", async () => {
    // Act
    const app = await setup("/", true);

    // Assert
    expect(app.href()).toBe("/");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("should send a signed-out person to login with this page to come back to, and say why", async () => {
    // Act
    const app = await setup("/");

    // Assert
    expect(app.href()).toBe("/login?redirect=%2F");
    expect(toast.error).toHaveBeenCalledExactlyOnceWith("Unauthorized");
  });
});

describe("requireNoSession", () => {
  beforeEach(() => {
    vi.mocked(toast.info).mockClear();
  });

  it("should let a signed-out person open the login", async () => {
    // Act
    const app = await setup("/login");

    // Assert
    expect(app.href()).toBe("/login");
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("should send a signed-in person home, and say why", async () => {
    // Act
    const app = await setup("/login", true);

    // Assert
    expect(app.href()).toBe("/");
    expect(toast.info).toHaveBeenCalledExactlyOnceWith("Already Logged In");
  });

  it("should send a signed-in person to the page that the redirect names", async () => {
    // Act
    const app = await setup("/login?redirect=%2F%3Ftab%3D2", true);

    // Assert
    expect(app.href()).toBe("/?tab=2");
  });

  it("should not follow a redirect that leaves the app", async () => {
    // Act
    const app = await setup("/login?redirect=https%3A%2F%2Fevil.example", true);

    // Assert
    expect(app.href()).toBe("/");
  });
});

describe("watch", () => {
  beforeEach(() => {
    vi.mocked(toast.error).mockClear();
    vi.mocked(toast.info).mockClear();
  });

  it("should leave the page when End Session runs, and not blame the person", async () => {
    // Arrange
    const app = await setup("/", true);
    app.gate.watch(app.router);

    // Act
    await app.signOut();

    // Assert
    await vi.waitFor(() => {
      expect(app.href()).toBe("/login?redirect=%2F");
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("should leave the login when Session Start runs, and go back to where the person was", async () => {
    // Arrange
    const app = await setup("/login?redirect=%2F%3Ftab%3D2");
    app.gate.watch(app.router);

    // Act
    await app.signIn();

    // Assert
    await vi.waitFor(() => {
      expect(app.href()).toBe("/?tab=2");
    });
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("should go home after a login that has no redirect", async () => {
    // Arrange
    const app = await setup("/login");
    app.gate.watch(app.router);

    // Act
    await app.signIn();

    // Assert
    await vi.waitFor(() => {
      expect(app.href()).toBe("/");
    });
  });

  it("should not reload the router when a Session replaces a Session", async () => {
    // Arrange
    const app = await setup("/", true);
    const invalidate = vi.spyOn(app.router, "invalidate");
    app.gate.watch(app.router);

    // Act
    await app.signIn();
    await app.signIn();
    // The listener runs in a later task. This lets any pending one finish.
    await sleep(20);

    // Assert
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("should stop reloading after the returned function runs", async () => {
    // Arrange
    const app = await setup("/", true);
    const stop = app.gate.watch(app.router);
    stop();

    // Act
    await app.signOut();
    await sleep(20);

    // Assert
    expect(app.href()).toBe("/");
  });
});

describe("loginSearchSchema", () => {
  it("should keep a redirect that is a path of this app", () => {
    for (const value of ["/", "/?tab=2", "/a/b?c=d#e"]) {
      // Act
      const search = decode({ redirect: value });

      // Assert
      expect(search).toStrictEqual({ redirect: value });
    }
  });

  it("should drop a redirect that is not a path of this app, or that is the login", () => {
    // Arrange
    const values = [
      42,
      "",
      "home",
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/\t/evil.example",
      "/login",
      "/login?redirect=%2F",
    ];

    for (const value of values) {
      // Act
      const search = decode({ redirect: value });

      // Assert
      // An explicit `undefined`: the router lets the raw value stand over a missing key.
      expect(search).toStrictEqual({ redirect: undefined });
    }
  });

  it("should accept a search with no redirect and ignore every other key", () => {
    // Act
    const empty = decode({});
    const other = decode({ other: 1 });

    // Assert
    expect(empty).toStrictEqual({});
    expect(other).toStrictEqual({});
  });

  test.prop([redirectCandidateArb])(
    "should never keep a redirect that leaves the app or opens the login",
    (value) => {
      // Act
      const { redirect } = decode({ redirect: value });

      // Assert
      if (redirect !== undefined) {
        const target = new URL(redirect, appOrigin);
        expect(target.origin).toBe(appOrigin);
        expect(target.pathname).not.toBe("/login");
      }
    }
  );

  test.prop([appPathArb, fc.webQueryParameters(), fc.webFragments()])(
    "should always keep a path of this app as it is",
    (path, query, fragment) => {
      // Arrange
      const value = `${path}?${query}#${fragment}`;

      // Act
      const search = decode({ redirect: value });

      // Assert
      expect(search).toStrictEqual({ redirect: value });
    }
  );
});
