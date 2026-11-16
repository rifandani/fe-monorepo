import { redirect } from "@tanstack/react-router";
import type { Persistence } from "@workspace/core/persistence/persistence";
import { Effect, Schema } from "effect";
import { toast } from "sonner";

import { persistence } from "@/lib/layers/persistence";

/** A base only for parsing. A target that leaves this origin is not a path of this app. */
const parseBase = "http://session-gate.invalid";
const loginPath = "/login";

/**
 * Browsers read `\`, tabs and new lines like `/`, so `/\evil.com` and
 * `//evil.com` both mean another host. The URL parser applies those same rules,
 * so this compares the origin after parsing and does not match the text. The
 * login page itself is refused, because a redirect to it would loop.
 */
const isPathOfThisApp = (value: string) => {
  if (!value.startsWith("/") || !URL.canParse(value, parseBase)) {
    return false;
  }

  const url = new URL(value, parseBase);

  return url.origin === parseBase && url.pathname !== loginPath;
};

/**
 * @description The search of `/login`. `redirect` is where to go after the
 * sign-in. It is kept only when it is a path of this app, so a crafted link
 * cannot send a signed-in person to another site (an open redirect). Any other
 * value — another site, a number, a second `redirect` — is not an error: it
 * becomes `undefined`.
 *
 * The router merges the validated search over the raw one, so a dropped value
 * must come back as an explicit `undefined`. A missing key would leave the raw
 * value in place.
 */
export const loginSearchSchema = Schema.Struct({
  redirect: Schema.optionalKey(
    Schema.UndefinedOr(
      Schema.String.check(Schema.makeFilter(isPathOfThisApp))
    ).pipe(Schema.catchDecoding(() => Effect.succeedSome(undefined)))
  ),
});

type LoginSearch = typeof loginSearchSchema.Type;

/**
 * @description How the router reached the route. `enter` is a navigation to the
 * route. `stay` is a reload of a route that is already open — for example, the
 * reload that the gate causes when the Session changes.
 */
type Cause = "preload" | "enter" | "stay";

/**
 * @description The Session gate: the one place that decides which routes need a
 * Session and which need none, and the one place that makes those rules hold
 * when the Session changes while a route is open.
 *
 * `beforeLoad` runs on a navigation only. It does not run when End Session
 * happens (the person signs out, or Http ends the Session after a 401) or when
 * Session Start happens (a login). So `watch` reloads the router when the Session
 * appears or disappears, and the guards run again and send the person where the
 * rules say. A sign-in and a sign-out are therefore not navigations that a
 * component must remember to start: the Session is the navigation. This is what
 * `Stack.Protected` does in expo.
 *
 * The toasts only appear when the person navigates to the wrong place. A reload
 * that the gate caused is not a mistake: a sign-out is intended, and a login
 * shows the page that it opens.
 *
 * It is a factory so that a test can give it an in-memory Persistence.
 *
 * @example
 *
 * ```ts
 * export const Route = createFileRoute("/")({
 *   beforeLoad: sessionGate.requireSession,
 * });
 * ```
 */
export const createSessionGate = ({
  registry,
  sessionAtom,
}: Pick<Persistence, "registry" | "sessionAtom">) => {
  // Reads the atom, not `localStorage`. `Atom.kvs` over the synchronous
  // `localStorage` decodes the stored Session on the first read, so the Session
  // is in the registry before any route resolves. If this app ever moves to an
  // asynchronous storage, that stops being true and this needs revisiting.
  const isSignedIn = () => registry.get(sessionAtom) !== null;

  return {
    /**
     * @description `beforeLoad` of a route that needs a Session. Without one, go
     * to `/login`, and come back to this location after the sign-in.
     */
    requireSession: ({
      cause,
      location,
    }: {
      cause: Cause;
      location: { href: string };
    }): void => {
      if (isSignedIn()) {
        return;
      }

      if (cause === "enter") {
        toast.error("Unauthorized");
      }

      throw redirect({
        search: {
          // The current location, to come back to after the sign-in.
          // (Not `router.state.resolvedLocation`: it can lag behind the actual one.)
          redirect: location.href,
        },
        to: loginPath,
      });
    },

    /**
     * @description `beforeLoad` of a route for a person with no Session (the
     * login). With one, go to the place that the sign-in came from, or home.
     */
    requireNoSession: ({
      cause,
      search,
    }: {
      cause: Cause;
      search: LoginSearch;
    }): void => {
      if (!isSignedIn()) {
        return;
      }

      if (cause === "enter") {
        toast.info("Already Logged In");
      }

      // `search.redirect` passed `loginSearchSchema`, so it is a path of this app.
      throw redirect({ href: search.redirect ?? "/" });
    },

    /**
     * @description Reload `router` when the Session appears or disappears, so
     * the guards run again. Call it once, after the router is made. A change
     * inside a Session (same person, new value) is no reason to reload.
     *
     * @returns A function that stops watching.
     */
    watch: (router: { invalidate: () => Promise<void> }): (() => void) => {
      let signedIn = isSignedIn();

      return registry.subscribe(sessionAtom, () => {
        const now = isSignedIn();

        if (now === signedIn) {
          return;
        }

        signedIn = now;
        void router.invalidate();
      });
    },
  };
};

/** @description The gate on the Persistence of this app. */
export const sessionGate = createSessionGate(persistence);
