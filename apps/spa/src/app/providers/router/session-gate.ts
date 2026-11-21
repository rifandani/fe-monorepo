import { redirect } from "@tanstack/react-router";
import type { Persistence } from "@workspace/core/persistence/persistence";
import { Effect, Schema } from "effect";
import { toast } from "sonner";

import { persistence } from "@/lib/layers/persistence";

const parseBase = "http://session-gate.invalid";
const loginPath = "/login";

const isPathOfThisApp = (value: string) => {
  if (!value.startsWith("/") || !URL.canParse(value, parseBase)) {
    return false;
  }

  const url = new URL(value, parseBase);

  return url.origin === parseBase && url.pathname !== loginPath;
};

export const loginSearchSchema = Schema.Struct({
  redirect: Schema.optionalKey(
    Schema.UndefinedOr(
      Schema.String.check(Schema.makeFilter(isPathOfThisApp))
    ).pipe(Schema.catchDecoding(() => Effect.succeedSome(undefined)))
  ),
});

type LoginSearch = typeof loginSearchSchema.Type;

type Cause = "preload" | "enter" | "stay";

export const createSessionGate = ({
  registry,
  sessionAtom,
}: Pick<Persistence, "registry" | "sessionAtom">) => {
  const isSignedIn = () => registry.get(sessionAtom) !== null;

  return {
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
          redirect: location.href,
        },
        to: loginPath,
      });
    },

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

      throw redirect({ href: search.redirect ?? "/" });
    },

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

export const sessionGate = createSessionGate(persistence);
