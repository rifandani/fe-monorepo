import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { render } from "vitest-browser-react/pure";

import { Entry } from "@/app/entry";
import { router } from "@/app/providers/router/client";
import { persistence } from "@/lib/layers/persistence";

// The real stylesheet, as `main.tsx` loads it: visibility assertions must see
// the real layout (for example `hidden md:block`).
import "@/styles/globals.css";

interface RenderRouteOptions {
  /**
   * The Session the person already has when they arrive. `null` (the default)
   * means a signed-out visitor.
   */
  readonly session?: AuthLoginResponseSchema | null;
}

/**
 * @description Open the whole app at `path`, the way a person arrives at it.
 *
 * It mounts `<Entry />`, the exact tree `main.tsx` renders, with the production
 * `router` singleton on the real browser history. Nothing is stubbed but the
 * network (`network.ts`). The Session is written through the app's own
 * Persistence, so a change to how the Session is stored cannot leave the tests
 * behind.
 *
 * @example
 *
 * ```tsx
 * await renderRoute("/", { session: emilySession });
 * await expect.element(page.getByRole("heading", { level: 1 })).toBeVisible();
 * ```
 */
export const renderRoute = async (
  path: string,
  { session = null }: RenderRouteOptions = {}
) => {
  persistence.registry.set(persistence.sessionAtom, session);
  router.history.replace(path);

  const screen = await render(<Entry />);

  // Resolve the arrival on the new URL. Two stale things can wait on the
  // singleton router here: a Session change (above, or the reset of the last
  // test) makes the Session gate reload the router on the *old* URL, and the
  // mounted `Transitioner` skips its own load while that reload is pending.
  // This load reads the new URL and replaces the stale one.
  //
  // It must come after the mount. The router waits for the mounted tree to
  // acknowledge each load; before the mount, the only listener is the tree
  // that the last test unmounted, so a load would never resolve.
  await router.load();

  return screen;
};

/** The path the router is on now, for assertions on redirects. */
export const currentPath = () => router.state.location.pathname;
