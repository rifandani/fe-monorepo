import { RegistryContext } from "@effect/atom-react";
import type { PropsWithChildren } from "react";

import { appRegistry } from "@/core/services/atom-registry";

/**
 * Hands `appRegistry` to every atom hook below. Not `RegistryProvider`, which
 * would create a second registry that code outside React cannot reach.
 */
export const AppAtomProvider = ({ children }: PropsWithChildren) => (
  <RegistryContext value={appRegistry}>{children}</RegistryContext>
);
