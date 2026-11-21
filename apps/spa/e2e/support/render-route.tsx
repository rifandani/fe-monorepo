import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { render } from "vitest-browser-react/pure";

import { Entry } from "@/app/entry";
import { router } from "@/app/providers/router/client";
import { persistence } from "@/lib/layers/persistence";

import "@/styles/globals.css";

interface RenderRouteOptions {
  readonly session?: AuthLoginResponseSchema | null;
}

export const renderRoute = async (
  path: string,
  { session = null }: RenderRouteOptions = {}
) => {
  persistence.registry.set(persistence.sessionAtom, session);
  router.history.replace(path);

  const screen = await render(<Entry />);

  await router.load();

  return screen;
};

export const currentPath = () => router.state.location.pathname;
