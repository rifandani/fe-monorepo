import { RegistryContext } from "@effect/atom-react";
import type { Persistence } from "@workspace/core/persistence/persistence";
import { createElement } from "react";
import type { ReactNode } from "react";

export const PersistenceProvider = ({
  persistence,
  children,
}: {
  persistence: Pick<Persistence, "registry">;
  children?: ReactNode;
}) => createElement(RegistryContext, { value: persistence.registry }, children);
