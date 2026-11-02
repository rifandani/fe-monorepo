import { beforeEach, describe, expect, it, vi } from "vitest";

import { featureFlagStore } from "@/core/feature-flags/feature-flag-store";
import {
  isFeatureEnabled,
  resolveFeatureEnabled,
} from "@/core/feature-flags/is-enabled";

/** A fresh module graph, so the atom reads storage before anything writes. */
const loadFresh = async () => {
  vi.resetModules();

  return await import("@/core/feature-flags/feature-flag-store");
};

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

describe("featureFlagStore overrides", () => {
  beforeEach(() => {
    featureFlagStore.resetAllOverrides();
  });

  it("setOverride / resetOverride round-trip", () => {
    featureFlagStore.setOverride("componentCatalog", false);
    expect(featureFlagStore.overrides().componentCatalog).toBe(false);

    featureFlagStore.resetOverride("componentCatalog");
    expect(featureFlagStore.overrides().componentCatalog).toBeUndefined();
  });

  it("resetAllOverrides clears every override", () => {
    featureFlagStore.setOverride("componentCatalog", true);
    featureFlagStore.resetAllOverrides();

    expect(featureFlagStore.overrides()).toEqual({});
  });

  it("isFeatureEnabled honors a stored override", () => {
    featureFlagStore.setOverride("componentCatalog", false);

    expect(isFeatureEnabled("componentCatalog")).toBe(false);
  });
});

describe("featureFlagOverridesAtom on first read", () => {
  it("has no overrides when nothing is persisted", async () => {
    localStorage.clear();
    const fresh = await loadFresh();

    expect(fresh.featureFlagStore.overrides()).toEqual({});
  });

  it("rehydrates persisted overrides", async () => {
    localStorage.setItem(
      "app-feature-flags",
      JSON.stringify({ componentCatalog: false })
    );
    const fresh = await loadFresh();

    expect(fresh.featureFlagStore.overrides()).toEqual({
      componentCatalog: false,
    });
  });

  it("drops an override for a flag that no longer exists", async () => {
    localStorage.setItem(
      "app-feature-flags",
      JSON.stringify({ componentCatalog: true, retired: true })
    );
    const fresh = await loadFresh();

    expect(fresh.featureFlagStore.overrides()).toEqual({
      componentCatalog: true,
    });
  });

  it("reads a malformed set as no overrides", async () => {
    localStorage.setItem(
      "app-feature-flags",
      JSON.stringify({ componentCatalog: "yes" })
    );
    const fresh = await loadFresh();

    expect(fresh.featureFlagStore.overrides()).toEqual({});
  });
});
