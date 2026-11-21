import { toLocale } from "@workspace/core/i18n/locale";
import { makePersistence } from "@workspace/core/persistence/persistence";
import { KeyValueStore } from "effect/persistence";

export const persistence = makePersistence(
  KeyValueStore.layerStorage(() => localStorage),
  { defaultLocale: () => toLocale(navigator.language) }
);
