import { fc, test } from "@fast-check/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { featureFlagStore } from "@/lib/feature-flags/feature-flag-store";
import {
  isFeatureEnabled,
  resolveFeatureEnabled,
} from "@/lib/feature-flags/is-enabled";

// Helpers

const FLAGS_KEY = "app-feature-flags";

/** A fresh module graph, so the atom reads storage before anything writes. */
const loadFresh = async () => {
  vi.resetModules();

  return await import("@/lib/feature-flags/feature-flag-store");
};

const overrideArb = fc.option(fc.boolean(), { nil: undefined });

describe("resolveFeatureEnabled", () => {
  it("should return false outside DEV even with an ON override", () => {
    // Act
    const enabled = resolveFeatureEnabled({
      isDev: false,
      override: true,
      defaultEnabled: true,
    });

    // Assert
    expect(enabled).toBe(false);
  });

  it("should use the default in DEV when there is no override", () => {
    // Act
    const onByDefault = resolveFeatureEnabled({
      isDev: true,
      override: undefined,
      defaultEnabled: true,
    });

    const offByDefault = resolveFeatureEnabled({
      isDev: true,
      override: undefined,
      defaultEnabled: false,
    });

    // Assert
    expect(onByDefault).toBe(true);
    expect(offByDefault).toBe(false);
  });

  it("should honor an override in DEV", () => {
    // Act
    const enabled = resolveFeatureEnabled({
      isDev: true,
      override: false,
      defaultEnabled: true,
    });

    // Assert
    expect(enabled).toBe(false);
  });

  test.prop([overrideArb, fc.boolean()])(
    "should never enable a flag outside DEV",
    (override, defaultEnabled) => {
      // Act
      const enabled = resolveFeatureEnabled({
        isDev: false,
        override,
        defaultEnabled,
      });

      // Assert
      expect(enabled).toBe(false);
    }
  );

  test.prop([fc.boolean(), fc.boolean()])(
    "should always let an override in DEV win over the default",
    (override, defaultEnabled) => {
      // Act
      const enabled = resolveFeatureEnabled({
        isDev: true,
        override,
        defaultEnabled,
      });

      // Assert
      expect(enabled).toBe(override);
    }
  );
});

describe("featureFlagStore", () => {
  beforeEach(() => {
    featureFlagStore.resetAllOverrides();
  });

  it("should set and then reset one override", () => {
    // Act
    featureFlagStore.setOverride("componentCatalog", false);
    const afterSet = featureFlagStore.overrides().componentCatalog;
    featureFlagStore.resetOverride("componentCatalog");
    const afterReset = featureFlagStore.overrides().componentCatalog;

    // Assert
    expect(afterSet).toBe(false);
    expect(afterReset).toBeUndefined();
  });

  it("should clear every override", () => {
    // Arrange
    featureFlagStore.setOverride("componentCatalog", true);

    // Act
    featureFlagStore.resetAllOverrides();

    // Assert
    expect(featureFlagStore.overrides()).toEqual({});
  });
});

describe("isFeatureEnabled", () => {
  beforeEach(() => {
    featureFlagStore.resetAllOverrides();
  });

  it("should honor a stored override", () => {
    // Arrange
    featureFlagStore.setOverride("componentCatalog", false);

    // Act
    const enabled = isFeatureEnabled("componentCatalog");

    // Assert
    expect(enabled).toBe(false);
  });
});

describe("featureFlagOverridesAtom", () => {
  it("should have no overrides when nothing is persisted", async () => {
    // Arrange
    localStorage.clear();

    // Act
    const fresh = await loadFresh();

    // Assert
    expect(fresh.featureFlagStore.overrides()).toEqual({});
  });

  it("should rehydrate persisted overrides", async () => {
    // Arrange
    localStorage.setItem(
      FLAGS_KEY,
      JSON.stringify({ componentCatalog: false })
    );

    // Act
    const fresh = await loadFresh();

    // Assert
    expect(fresh.featureFlagStore.overrides()).toEqual({
      componentCatalog: false,
    });
  });

  it("should drop an override for a flag that no longer exists", async () => {
    // Arrange
    localStorage.setItem(
      FLAGS_KEY,
      JSON.stringify({ componentCatalog: true, retired: true })
    );

    // Act
    const fresh = await loadFresh();

    // Assert
    expect(fresh.featureFlagStore.overrides()).toEqual({
      componentCatalog: true,
    });
  });

  it("should read a malformed set as no overrides", async () => {
    // Arrange
    localStorage.setItem(
      FLAGS_KEY,
      JSON.stringify({ componentCatalog: "yes" })
    );

    // Act
    const fresh = await loadFresh();

    // Assert
    expect(fresh.featureFlagStore.overrides()).toEqual({});
  });
});
