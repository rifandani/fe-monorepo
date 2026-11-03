import { Schema } from "effect";
import { Atom } from "effect/reactivity";

import { featureFlagIds } from "@/core/feature-flags/registry";
import type { FeatureFlagId } from "@/core/feature-flags/registry";
import { persistence } from "@/core/layers/persistence";

const { registry } = persistence;

/** Key the Feature Flag overrides are persisted under in `localStorage`. */
export const featureFlagStoreName = "app-feature-flags" as const;

const featureFlagOverridesSchema = Schema.Record(
  Schema.Literals(featureFlagIds),
  Schema.optionalKey(Schema.Boolean)
);

/**
 * @description Feature Flag overrides set from the devtools panel.
 *
 * Decoded on read: an override for a flag that no longer exists is dropped,
 * and a malformed value makes the whole set fall back to "no overrides" —
 * never a half-trusted mix.
 */
export const featureFlagOverridesAtom = Atom.kvs({
  runtime: persistence.runtime,
  key: featureFlagStoreName,
  schema: featureFlagOverridesSchema,
  defaultValue: () => ({}),
}).pipe(Atom.keepAlive, Atom.withLabel("featureFlagOverrides"));

/**
 * @description Read and change overrides outside React, on the same registry the
 * panel's hooks subscribe to.
 */
export const featureFlagStore = {
  overrides: () => registry.get(featureFlagOverridesAtom),
  setOverride: (id: FeatureFlagId, enabled: boolean) => {
    registry.update(featureFlagOverridesAtom, (overrides) => ({
      ...overrides,
      [id]: enabled,
    }));
  },
  resetOverride: (id: FeatureFlagId) => {
    registry.update(featureFlagOverridesAtom, (overrides) => {
      const { [id]: _removed, ...rest } = overrides;

      return rest;
    });
  },
  resetAllOverrides: () => {
    registry.set(featureFlagOverridesAtom, {});
  },
} as const;
