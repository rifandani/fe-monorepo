import { featureFlagStore } from "@/lib/feature-flags/feature-flag-store";
import { getFeatureFlagDefinition } from "@/lib/feature-flags/registry";
import type { FeatureFlagId } from "@/lib/feature-flags/registry";

export interface ResolveFeatureEnabledInput {
  isDev: boolean;
  override: boolean | undefined;
  defaultEnabled: boolean;
}

export const resolveFeatureEnabled = ({
  isDev,
  override,
  defaultEnabled,
}: ResolveFeatureEnabledInput): boolean => {
  if (!isDev) {
    return false;
  }

  if (override !== undefined) {
    return override;
  }

  return defaultEnabled;
};

export const isFeatureEnabled = (id: FeatureFlagId): boolean =>
  resolveFeatureEnabled({
    isDev: import.meta.env.DEV,
    override: featureFlagStore.overrides()[id],
    defaultEnabled: getFeatureFlagDefinition(id).defaultEnabled,
  });
