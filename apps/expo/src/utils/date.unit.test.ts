import { describe, expect, it } from "vitest";

import { formatDisplayDate } from "./date";

describe("formatDisplayDate", () => {
  it("formats ISO dates in English", () => {
    expect(formatDisplayDate("1990-01-01", "en-us")).toBe("January 1st, 1990");
  });

  it("formats ISO dates in Indonesian", () => {
    expect(formatDisplayDate("1990-01-01", "id-id")).toBe("1 Januari 1990");
  });

  it("falls back for unpadded Date-parseable strings", () => {
    expect(formatDisplayDate("1996-5-30", "en-us")).toBe("May 30th, 1996");
  });

  it("returns the raw string when parsing fails", () => {
    expect(formatDisplayDate("not-a-date", "en-us")).toBe("not-a-date");
  });
});
