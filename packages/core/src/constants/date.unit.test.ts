import { RESOLVED_DATE_TIME_FORMAT_OPTIONS } from "@workspace/core/constants/date";
import { describe, expect, it } from "vitest";

describe("RESOLVED_DATE_TIME_FORMAT_OPTIONS", () => {
  it("resolves GMT/UTC timezone options", () => {
    expect(["GMT", "UTC"]).toContain(
      RESOLVED_DATE_TIME_FORMAT_OPTIONS.timeZone
    );
    expect(RESOLVED_DATE_TIME_FORMAT_OPTIONS.locale).toMatch(/id/iu);
  });
});
