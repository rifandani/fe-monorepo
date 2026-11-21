import { Schema } from "effect";
import { Atom } from "effect/reactivity";

import { featureFlagIds } from "@/lib/feature-flags/registry";
import type { FeatureFlagId } from "@/lib/feature-flags/registry";
import { persistence } from "@/lib/layers/persistence";

const { registry } = persistence;

export const featureFlagStoreName = "app-feature-flags" as const;

const featureFlagOverridesSchema = Schema.Record(
  Schema.Literals(featureFlagIds),
  Schema.optionalKey(Schema.Boolean)
);

export const featureFlagOverridesAtom = Atom.kvs({
  runtime: persistence.runtime,
  key: featureFlagStoreName,
  schema: featureFlagOverridesSchema,
  defaultValue: () => ({}),
}).pipe(Atom.keepAlive, Atom.withLabel("featureFlagOverrides"));

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
