import { makePersistence } from "@workspace/core/persistence/persistence";
import { KeyValueStore } from "effect/persistence";

/**
 * @description The persisted client state of this app, on `localStorage`.
 *
 * `localStorage` is synchronous, so every atom here holds its persisted value on
 * the first read — before any route resolves.
 */
export const persistence = makePersistence(
  KeyValueStore.layerStorage(() => localStorage),
  { defaultLocale: () => navigator.language.toLowerCase() }
);
