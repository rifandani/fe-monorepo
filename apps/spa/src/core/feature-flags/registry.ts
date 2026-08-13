export const featureFlagIds = ["componentCatalog"] as const;

export type FeatureFlagId = (typeof featureFlagIds)[number];

export interface FeatureFlagDefinition {
  id: FeatureFlagId;
  label: string;
  /** Sticky group heading in the Feature Flags panel (shown UPPERCASE). */
  section: string;
  /** Default when running in development and no override is stored. */
  defaultEnabled: boolean;
}

export const featureFlagRegistry: readonly FeatureFlagDefinition[] = [
  {
    id: "componentCatalog",
    label: "Component Catalog",
    section: "Catalog",
    defaultEnabled: true,
  },
];

export const getFeatureFlagDefinition = (
  id: FeatureFlagId
): FeatureFlagDefinition => {
  const def = featureFlagRegistry.find((flag) => flag.id === id);
  if (!def) {
    throw new Error(`Unknown Feature Flag: ${id}`);
  }
  return def;
};
