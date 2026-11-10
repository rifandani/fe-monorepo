import { RegistryContext } from "@effect/atom-react";
import type { Persistence } from "@workspace/core/persistence/persistence";
import { createElement } from "react";
import type { ReactNode } from "react";

/**
 * @description Give the app's one registry to every atom hook below.
 *
 * Not `RegistryProvider`: that creates a second registry, which code outside
 * React cannot reach.
 */
export const PersistenceProvider = ({
  persistence,
  children,
}: {
  persistence: Pick<Persistence, "registry">;
  children?: ReactNode;
}) => createElement(RegistryContext, { value: persistence.registry }, children);
