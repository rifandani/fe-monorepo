import { fc, test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import { formatDisplayDate } from "./date";

const isoDayArb = fc
  .date({
    min: new Date("1000-01-01T00:00:00.000Z"),
    max: new Date("9999-12-31T00:00:00.000Z"),
    noInvalidDate: true,
  })
  .map((date) => date.toISOString().slice(0, 10));

describe("formatDisplayDate", () => {
  it("should format an ISO date in English", () => {
    const text = formatDisplayDate("1990-01-01", "en-us");

    expect(text).toBe("January 1st, 1990");
  });

  it("should format an ISO date in Indonesian", () => {
    const text = formatDisplayDate("1990-01-01", "id-id");

    expect(text).toBe("1 Januari 1990");
  });

  it("should fall back to Date parsing for an unpadded date", () => {
    const text = formatDisplayDate("1996-5-30", "en-us");

    expect(text).toBe("May 30th, 1996");
  });

  it("should return the raw string when parsing fails", () => {
    const text = formatDisplayDate("not-a-date", "en-us");

    expect(text).toBe("not-a-date");
  });

  test.prop([isoDayArb])(
    "should always show the day of the month and the year of an ISO day",
    (isoDay) => {
      const [year, , day] = isoDay.split("-");

      const text = formatDisplayDate(isoDay, "id-id");

      expect(text).toMatch(
        new RegExp(`^${String(Number(day))} \\S+ ${year ?? ""}$`, "u")
      );
    }
  );

  test.prop([fc.string(), fc.constantFrom("en-us", "id-id")])(
    "should never throw, whatever the input",
    (value, locale) => {
      const act = () => formatDisplayDate(value, locale);

      expect(act).not.toThrow();
    }
  );
});
