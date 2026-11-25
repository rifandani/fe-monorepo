import { fc, test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import {
  featureFlagRegistry,
  findExpiredFeatureFlags,
  isIsoDate,
} from "@/lib/feature-flags/registry";
import type {
  FeatureFlagDefinition,
  IsoDate,
} from "@/lib/feature-flags/registry";

const DAY_MS = 86_400_000;
const GITHUB_LOGIN_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/iu;

const makeFlag = (removeBy: IsoDate): FeatureFlagDefinition => ({
  id: "componentCatalog",
  label: "Component Catalog",
  section: "Catalog",
  defaultEnabled: true,
  owner: "rifandani",
  removeBy,
});

const dateArb = () =>
  fc.date({
    min: new Date("0000-01-01T00:00:00.000Z"),
    max: new Date("9999-12-31T23:59:59.999Z"),
    noInvalidDate: true,
  });

const toIsoDate = (date: Date): IsoDate => {
  const value = date.toISOString().slice(0, 10);

  if (!isIsoDate(value)) {
    throw new Error(`Not an ISO date: ${value}`);
  }

  return value;
};

const describeExpired = (expired: readonly FeatureFlagDefinition[]): string =>
  expired
    .map(
      (flag) =>
        `Feature Flag "${flag.id}" expired on ${flag.removeBy} (owner: @${flag.owner}). ` +
        "Remove the flag, or move removeBy to a later date and record why in spa ADR-0001."
    )
    .join("\n");

describe("findExpiredFeatureFlags", () => {
  it("should return a flag when today is after its removeBy date", () => {
    const flag = makeFlag("2026-03-31");

    const expired = findExpiredFeatureFlags(
      [flag],
      new Date("2026-04-01T00:00:00.000Z")
    );

    expect(expired).toEqual([flag]);
  });

  it("should keep a flag until the end of its removeBy date", () => {
    const flag = makeFlag("2026-03-31");

    const expired = findExpiredFeatureFlags(
      [flag],
      new Date("2026-03-31T23:59:59.999Z")
    );

    expect(expired).toEqual([]);
  });

  it("should keep a flag before its removeBy date", () => {
    const flag = makeFlag("2026-03-31");

    const expired = findExpiredFeatureFlags(
      [flag],
      new Date("2025-12-31T12:00:00.000Z")
    );

    expect(expired).toEqual([]);
  });

  test.prop([dateArb(), dateArb()])(
    "should expire a flag only when its removeBy day is before the UTC day of today",
    (removeByDate, today) => {
      const flag = makeFlag(toIsoDate(removeByDate));
      const removeByDay = Math.floor(removeByDate.getTime() / DAY_MS);
      const todayDay = Math.floor(today.getTime() / DAY_MS);

      const expired = findExpiredFeatureFlags([flag], today);

      expect(expired).toEqual(removeByDay < todayDay ? [flag] : []);
    }
  );
});

describe("isIsoDate", () => {
  it("should accept a real calendar date", () => {
    expect(isIsoDate("2024-02-29")).toBe(true);
  });

  it.each(["2026-02-30", "2026-13-01", "2026-1-01", "26-01-01", "2026/01/01"])(
    "should reject %s",
    (value) => {
      expect(isIsoDate(value)).toBe(false);
    }
  );
});

describe("featureFlagRegistry", () => {
  it("should give each flag a removeBy that is a real calendar date", () => {
    const invalid = featureFlagRegistry.filter(
      (flag) => !isIsoDate(flag.removeBy)
    );

    expect(invalid).toEqual([]);
  });

  it("should give each flag an owner that is a GitHub login", () => {
    const invalid = featureFlagRegistry.filter(
      (flag) => !GITHUB_LOGIN_PATTERN.test(flag.owner)
    );

    expect(invalid).toEqual([]);
  });

  it("should not keep a flag past its removeBy date", () => {
    const expired = findExpiredFeatureFlags(featureFlagRegistry, new Date());

    expect(expired, describeExpired(expired)).toEqual([]);
  });
});
