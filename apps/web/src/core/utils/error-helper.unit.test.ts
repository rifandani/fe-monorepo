import { describe, expect, it } from "vitest";

import {
  errorAttributesFromUnknown,
  simplifyErrorObject,
} from "./error-helper";

describe("simplifyErrorObject", () => {
  it("extracts message, name, and stack", () => {
    const error = new Error("boom");
    error.name = "CustomError";
    expect(simplifyErrorObject(error)).toEqual({
      message: "boom",
      name: "CustomError",
      stack: error.stack,
    });
  });
});

describe("errorAttributesFromUnknown", () => {
  it("simplifies Error instances", () => {
    const error = new TypeError("bad type");
    expect(errorAttributesFromUnknown(error)).toEqual({
      message: "bad type",
      name: "TypeError",
      stack: error.stack,
    });
  });

  it("wraps string values", () => {
    expect(errorAttributesFromUnknown("plain")).toEqual({ message: "plain" });
  });

  it("JSON-stringifies plain objects", () => {
    expect(errorAttributesFromUnknown({ code: 1 })).toEqual({
      message: '{"code":1}',
    });
  });

  it("falls back to String for non-serializable values", () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;
    expect(errorAttributesFromUnknown(circular)).toEqual({
      message: String(circular),
    });
  });
});
