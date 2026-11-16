import { setTimeout as sleep } from "node:timers/promises";

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

const user: AuthLoginResponseSchema = {
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
    await run(startSession(user));
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
      await run(startSession(user));
    },
    signOut: async () => {
      await run(endSession);
    },
  };
};

beforeEach(() => {
  vi.mocked(toast.error).mockClear();
  vi.mocked(toast.info).mockClear();
});

describe("requireSession", () => {
  it("lets a signed-in person open the page", async () => {
    const app = await setup("/", true);

    expect(app.href()).toBe("/");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("sends a signed-out person to login, with this page to come back to, and says why", async () => {
    const app = await setup("/");

    expect(app.href()).toBe("/login?redirect=%2F");
    expect(toast.error).toHaveBeenCalledExactlyOnceWith("Unauthorized");
  });
});

describe("requireNoSession", () => {
  it("lets a signed-out person open the login", async () => {
    const app = await setup("/login");

    expect(app.href()).toBe("/login");
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("sends a signed-in person home, and says why", async () => {
    const app = await setup("/login", true);

    expect(app.href()).toBe("/");
    expect(toast.info).toHaveBeenCalledExactlyOnceWith("Already Logged In");
  });

  it("sends a signed-in person to the page that the redirect names", async () => {
    const app = await setup("/login?redirect=%2F%3Ftab%3D2", true);

    expect(app.href()).toBe("/?tab=2");
  });

  it("does not follow a redirect that leaves the app", async () => {
    const app = await setup("/login?redirect=https%3A%2F%2Fevil.example", true);

    expect(app.href()).toBe("/");
  });
});

describe("watch", () => {
  it("leaves the page when End Session runs, and does not blame the person", async () => {
    const app = await setup("/", true);
    app.gate.watch(app.router);

    await app.signOut();

    await vi.waitFor(() => {
      expect(app.href()).toBe("/login?redirect=%2F");
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("leaves the login when Session Start runs, and goes back to where the person was", async () => {
    const app = await setup("/login?redirect=%2F%3Ftab%3D2");
    app.gate.watch(app.router);

    await app.signIn();

    await vi.waitFor(() => {
      expect(app.href()).toBe("/?tab=2");
    });
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("goes home after a login that has no redirect", async () => {
    const app = await setup("/login");
    app.gate.watch(app.router);

    await app.signIn();

    await vi.waitFor(() => {
      expect(app.href()).toBe("/");
    });
  });

  it("does not reload the router when a Session replaces a Session", async () => {
    const app = await setup("/", true);
    const invalidate = vi.spyOn(app.router, "invalidate");
    app.gate.watch(app.router);

    await app.signIn();
    await app.signIn();

    // The listener runs in a later task. This lets any pending one finish.
    await sleep(20);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it("stops reloading after the returned function runs", async () => {
    const app = await setup("/", true);
    const stop = app.gate.watch(app.router);
    stop();

    await app.signOut();
    await sleep(20);

    expect(app.href()).toBe("/");
  });
});

describe("loginSearchSchema", () => {
  const decode = Schema.decodeUnknownSync(loginSearchSchema);

  it.each(["/", "/?tab=2", "/a/b?c=d#e"])("keeps the redirect %s", (value) => {
    expect(decode({ redirect: value })).toStrictEqual({ redirect: value });
  });

  it.each([
    42,
    "",
    "home",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example",
    "/login",
    "/login?redirect=%2F",
  ])("drops the redirect %j", (value) => {
    // An explicit `undefined`: the router lets the raw value stand over a missing key.
    expect(decode({ redirect: value })).toStrictEqual({ redirect: undefined });
  });

  it("accepts a search with no redirect, and ignores every other key", () => {
    expect(decode({})).toStrictEqual({});
    expect(decode({ other: 1 })).toStrictEqual({});
  });
});
