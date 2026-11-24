import { cleanup } from "vitest-browser-react/pure";

import { persistence } from "@/lib/layers/persistence";
import { queryClient } from "@/providers/query/client";

import { worker } from "./network";

export const resetApp = async () => {
  await cleanup();

  queryClient.clear();
  localStorage.clear();
  persistence.registry.refresh(persistence.sessionAtom);
  persistence.registry.refresh(persistence.themeAtom);
  persistence.registry.refresh(persistence.localeAtom);

  worker.resetHandlers();
};
