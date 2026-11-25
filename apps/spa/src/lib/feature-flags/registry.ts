export const featureFlagIds = ["componentCatalog"] as const;

export type FeatureFlagId = (typeof featureFlagIds)[number];

export type IsoDate = `${number}-${number}-${number}`;

export interface FeatureFlagDefinition {
  id: FeatureFlagId;
  label: string;
  section: string;
  defaultEnabled: boolean;
  owner: string;
  removeBy: IsoDate;
}

export const featureFlagRegistry: readonly FeatureFlagDefinition[] = [
  {
    id: "componentCatalog",
    label: "Component Catalog",
    section: "Catalog",
    defaultEnabled: true,
    owner: "rifandani",
    removeBy: "2027-05-31",
  },
];

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;

export const isIsoDate = (value: string): value is IsoDate => {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

export const findExpiredFeatureFlags = (
  flags: readonly FeatureFlagDefinition[],
  today: Date
): FeatureFlagDefinition[] => {
  const todayIso = today.toISOString().slice(0, 10);

  return flags.filter((flag) => flag.removeBy < todayIso);
};

export const getFeatureFlagDefinition = (
  id: FeatureFlagId
): FeatureFlagDefinition => {
  const def = featureFlagRegistry.find((flag) => flag.id === id);

  if (!def) {
    throw new Error(`Unknown Feature Flag: ${id}`);
  }

  return def;
};
