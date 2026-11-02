import { scheduleTask } from "@effect/atom-react";
import { AtomRegistry } from "effect/reactivity";

/**
 * @description The one atom registry of this app.
 *
 * React reads it through `AppAtomProvider`; code outside React — the `Http`
 * Session wiring, `endSession` — reads and writes the same instance here.
 */
export const appRegistry = AtomRegistry.make({
  scheduleTask,
  defaultIdleTTL: 400,
});
