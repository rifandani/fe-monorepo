import { fc, test } from "@fast-check/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  featureFlagStore,
  featureFlagStoreName,
} from "@/lib/feature-flags/feature-flag-store";
import {
  isFeatureEnabled,
  resolveFeatureEnabled,
} from "@/lib/feature-flags/is-enabled";
import storedV1 from "@/lib/feature-flags/stored-v1.json" with { type: "json" };

const FLAGS_KEY = featureFlagStoreName;

const loadFresh = async () => {
  vi.resetModules();

  return await import("@/lib/feature-flags/feature-flag-store");
};

const overrideArb = fc.option(fc.boolean(), { nil: undefined });

describe("resolveFeatureEnabled", () => {
  it("should return false outside DEV even with an ON override", () => {
    const enabled = resolveFeatureEnabled({
      isDev: false,
      override: true,
      defaultEnabled: true,
    });

    expect(enabled).toBe(false);
  });

  it("should use the default in DEV when there is no override", () => {
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

    expect(onByDefault).toBe(true);
    expect(offByDefault).toBe(false);
  });

  it("should honor an override in DEV", () => {
    const enabled = resolveFeatureEnabled({
      isDev: true,
      override: false,
      defaultEnabled: true,
    });

    expect(enabled).toBe(false);
  });

  test.prop([overrideArb, fc.boolean()])(
    "should never enable a flag outside DEV",
    (override, defaultEnabled) => {
      const enabled = resolveFeatureEnabled({
        isDev: false,
        override,
        defaultEnabled,
      });

      expect(enabled).toBe(false);
    }
  );

  test.prop([fc.boolean(), fc.boolean()])(
    "should always let an override in DEV win over the default",
    (override, defaultEnabled) => {
      const enabled = resolveFeatureEnabled({
        isDev: true,
        override,
        defaultEnabled,
      });

      expect(enabled).toBe(override);
    }
  );
});

describe("featureFlagStore", () => {
  beforeEach(() => {
    featureFlagStore.resetAllOverrides();
  });

  it("should set and then reset one override", () => {
    featureFlagStore.setOverride("componentCatalog", false);
    const afterSet = featureFlagStore.overrides().componentCatalog;
    featureFlagStore.resetOverride("componentCatalog");
    const afterReset = featureFlagStore.overrides().componentCatalog;

    expect(afterSet).toBe(false);
    expect(afterReset).toBeUndefined();
  });

  it("should clear every override", () => {
    featureFlagStore.setOverride("componentCatalog", true);

    featureFlagStore.resetAllOverrides();

    expect(featureFlagStore.overrides()).toEqual({});
  });
});

describe("isFeatureEnabled", () => {
  beforeEach(() => {
    featureFlagStore.resetAllOverrides();
  });

  it("should honor a stored override", () => {
    featureFlagStore.setOverride("componentCatalog", false);

    const enabled = isFeatureEnabled("componentCatalog");

    expect(enabled).toBe(false);
  });
});

describe("featureFlagOverridesAtom", () => {
  it("should have no overrides when nothing is persisted", async () => {
    localStorage.clear();

    const fresh = await loadFresh();

    expect(fresh.featureFlagStore.overrides()).toEqual({});
  });

  it("should decode the committed v1 snapshot of stored overrides", async () => {
    localStorage.clear();

    for (const [key, value] of Object.entries(storedV1)) {
      localStorage.setItem(key, JSON.stringify(value));
    }

    const fresh = await loadFresh();

    expect(fresh.featureFlagStore.overrides()).toEqual(
      storedV1["app-feature-flags.v1"]
    );
  });

  it("should rehydrate persisted overrides", async () => {
    localStorage.setItem(
      FLAGS_KEY,
      JSON.stringify({ componentCatalog: false })
    );

    const fresh = await loadFresh();

    expect(fresh.featureFlagStore.overrides()).toEqual({
      componentCatalog: false,
    });
  });

  it("should drop an override for a flag that no longer exists", async () => {
    localStorage.setItem(
      FLAGS_KEY,
      JSON.stringify({ componentCatalog: true, retired: true })
    );

    const fresh = await loadFresh();

    expect(fresh.featureFlagStore.overrides()).toEqual({
      componentCatalog: true,
    });
  });

  it("should read a malformed set as no overrides", async () => {
    localStorage.setItem(
      FLAGS_KEY,
      JSON.stringify({ componentCatalog: "yes" })
    );

    const fresh = await loadFresh();

    expect(fresh.featureFlagStore.overrides()).toEqual({});
  });
});
