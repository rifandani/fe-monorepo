import { scheduleTask } from "@effect/atom-react";
import { KeyValueStore } from "effect/persistence";
import { Atom, AtomRegistry } from "effect/reactivity";

/**
 * @description The one atom registry of this app.
 *
 * React reads it through `AppAtomProvider`; code outside React — route guards,
 * the `Http` Session wiring — reads and writes the same instance here, so both
 * sides always see one value.
 */
export const appRegistry = AtomRegistry.make({
  scheduleTask,
  defaultIdleTTL: 400,
});

/**
 * @description Atom runtime whose `KeyValueStore` is `localStorage`.
 *
 * `localStorage` is synchronous, so atoms built with `Atom.kvs` on this runtime
 * hold the persisted value on their first read — before any route resolves.
 */
export const localStorageRuntime = Atom.runtime(
  KeyValueStore.layerStorage(() => localStorage)
);
