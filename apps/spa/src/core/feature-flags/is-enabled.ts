import { featureFlagStore } from "@/core/feature-flags/feature-flag-store";
import { getFeatureFlagDefinition } from "@/core/feature-flags/registry";
import type { FeatureFlagId } from "@/core/feature-flags/registry";

export interface ResolveFeatureEnabledInput {
  isDev: boolean;
  override: boolean | undefined;
  defaultEnabled: boolean;
}

/** Pure resolver — used by `isFeatureEnabled` and unit tests. */
export const resolveFeatureEnabled = ({
  isDev,
  override,
  defaultEnabled,
}: ResolveFeatureEnabledInput): boolean => {
  // Production floor: never honor an ON override outside DEV.
  if (!isDev) {
    return false;
  }

  if (override !== undefined) {
    return override;
  }

  return defaultEnabled;
};

/**
 * Resolve whether a Feature Flag is on.
 * Outside DEV, always false (prod never honors ON overrides).
 */
export const isFeatureEnabled = (id: FeatureFlagId): boolean =>
  resolveFeatureEnabled({
    isDev: import.meta.env.DEV,
    override: featureFlagStore.overrides()[id],
    defaultEnabled: getFeatureFlagDefinition(id).defaultEnabled,
  });
