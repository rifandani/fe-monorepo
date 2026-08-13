import { beforeEach, describe, expect, it } from "vitest";

import { resolveFeatureEnabled } from "@/core/feature-flags/is-enabled";
import { useFeatureFlagStore } from "@/core/feature-flags/store";

describe("resolveFeatureEnabled", () => {
  it("returns false outside DEV even with an ON override", () => {
    expect(
      resolveFeatureEnabled({
        isDev: false,
        override: true,
        defaultEnabled: true,
      })
    ).toBe(false);
  });

  it("uses the default in DEV when there is no override", () => {
    expect(
      resolveFeatureEnabled({
        isDev: true,
        override: undefined,
        defaultEnabled: true,
      })
    ).toBe(true);
    expect(
      resolveFeatureEnabled({
        isDev: true,
        override: undefined,
        defaultEnabled: false,
      })
    ).toBe(false);
  });

  it("honors an override in DEV", () => {
    expect(
      resolveFeatureEnabled({
        isDev: true,
        override: false,
        defaultEnabled: true,
      })
    ).toBe(false);
  });
});

describe("useFeatureFlagStore overrides", () => {
  beforeEach(() => {
    localStorage.clear();
    useFeatureFlagStore.setState({ overrides: {} });
  });

  it("setOverride / resetOverride round-trip", () => {
    useFeatureFlagStore.getState().setOverride("componentCatalog", false);
    expect(useFeatureFlagStore.getState().overrides.componentCatalog).toBe(
      false
    );

    useFeatureFlagStore.getState().resetOverride("componentCatalog");
    expect(
      useFeatureFlagStore.getState().overrides.componentCatalog
    ).toBeUndefined();
  });
});
