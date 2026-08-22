import {
  clamp,
  deepReadObject,
  indonesianPhoneNumberFormat,
  objectToFormData,
  objectToFormDataArrayWithComma,
  removeLeadingWhitespace,
  removeLeadingZeros,
  toCamelCase,
  toSnakeCase,
} from "@workspace/core/utils/core";
import { describe, expect, it } from "vitest";

describe("clamp", () => {
  it("clamps above max", () => {
    expect(clamp({ value: 12, min: 0, max: 10 })).toBe(10);
  });

  it("clamps below min", () => {
    expect(clamp({ value: -5, min: 0, max: 10 })).toBe(0);
  });

  it("returns value in range", () => {
    expect(clamp({ value: 5, min: 0, max: 10 })).toBe(5);
  });
});

describe("indonesianPhoneNumberFormat", () => {
  it("formats +62 numbers", () => {
    expect(indonesianPhoneNumberFormat("+6281273636365")).toBe(
      "+62-812-7363-6365"
    );
  });

  it("picks a grouping per subscriber-number length", () => {
    // 6 digits or fewer
    expect(indonesianPhoneNumberFormat("+62812363636")).toBe("+62-812-363-636");
    // 7 digits
    expect(indonesianPhoneNumberFormat("+628123636365")).toBe(
      "+62-812-363-6365"
    );
    // 9 digits and up
    expect(indonesianPhoneNumberFormat("+62812736363651")).toBe(
      "+62-812-7363-63651"
    );
  });
});

describe("toCamelCase / toSnakeCase", () => {
  it("converts nested snake_case keys to camelCase", () => {
    expect(
      toCamelCase({ first_name: "Ada", nested: { last_name: "Lovelace" } })
    ).toEqual({
      firstName: "Ada",
      nested: { lastName: "Lovelace" },
    });
  });

  it("converts nested camelCase keys to snake_case", () => {
    expect(
      toSnakeCase({ firstName: "Ada", nested: { lastName: "Lovelace" } })
    ).toEqual({
      first_name: "Ada",
      nested: { last_name: "Lovelace" },
    });
  });

  it("maps arrays", () => {
    expect(toCamelCase([{ user_id: 1 }])).toEqual([{ userId: 1 }]);
    expect(toSnakeCase([{ userId: 1 }])).toEqual([{ user_id: 1 }]);
  });

  it("drops keys whose value is undefined", () => {
    expect(toCamelCase({ first_name: "Ada", middle_name: undefined })).toEqual({
      firstName: "Ada",
    });
    expect(toSnakeCase({ firstName: "Ada", middleName: undefined })).toEqual({
      first_name: "Ada",
    });
  });

  it("passes primitives and null through untouched", () => {
    expect(toCamelCase("a_b")).toBe("a_b");
    expect(toCamelCase(null)).toBeNull();
    expect(toSnakeCase(42)).toBe(42);
    expect(toSnakeCase(null)).toBeNull();
  });
});

describe("removeLeadingZeros", () => {
  it("strips a single leading zero before a non-zero digit", () => {
    expect(removeLeadingZeros("0123")).toBe("123");
  });

  it("collapses multiple leading zeros to one", () => {
    expect(removeLeadingZeros("000")).toBe("0");
  });
});

describe("removeLeadingWhitespace", () => {
  it("returns empty string for undefined", () => {
    expect(removeLeadingWhitespace()).toBe("");
  });

  it("strips whitespace-only strings", () => {
    expect(removeLeadingWhitespace("   ")).toBe("");
  });

  it("leaves mixed strings unchanged", () => {
    expect(removeLeadingWhitespace("  hi")).toBe("  hi");
  });
});

describe("objectToFormData", () => {
  it("flattens nested objects and arrays", () => {
    const formData = objectToFormData({
      num: 1,
      name: "str",
      nested: { key: "v" },
      array: [{ nested_key1: { name: "key1" } }],
    });
    expect(formData.get("num")).toBe("1");
    expect(formData.get("name")).toBe("str");
    expect(formData.get("nested.key")).toBe("v");
    expect(formData.get("array[0].nested_key1.name")).toBe("key1");
  });

  it("ignores listed keys", () => {
    const formData = objectToFormData(
      { keep: "a", drop: "b" },
      { ignoreList: ["drop"] }
    );
    expect(formData.get("keep")).toBe("a");
    expect(formData.get("drop")).toBeNull();
  });

  it("appends File values as-is", () => {
    const file = new File(["hi"], "hi.txt", { type: "text/plain" });
    const formData = objectToFormData({ avatar: file });
    expect(formData.get("avatar")).toBeInstanceOf(File);
    // SAFETY: the assertion on the previous line established the entry is a File.
    expect((formData.get("avatar") as File).name).toBe("hi.txt");
  });

  it("skips null and undefined leaves", () => {
    const formData = objectToFormData({
      empty: null,
      missing: undefined,
      kept: "yes",
    });
    expect(formData.get("empty")).toBeNull();
    expect(formData.get("missing")).toBeNull();
    expect(formData.get("kept")).toBe("yes");
  });

  it("skips inherited enumerable properties", () => {
    // SAFETY: `Object.create` returns `any`; the prototype and the own property
    // assigned below are both string-valued, which is what the walk reads.
    const obj = Object.create({ inherited: "no" }) as Record<string, string>;
    obj.own = "yes";
    const formData = objectToFormData({ nested: obj });
    expect(formData.get("nested.own")).toBe("yes");
    expect(formData.get("nested.inherited")).toBeNull();
  });
});

describe("objectToFormDataArrayWithComma", () => {
  it("joins string arrays with commas", () => {
    const formData = objectToFormDataArrayWithComma({
      filters: ["model", "category"],
    });
    expect(formData.get("filters")).toBe("model,category");
  });
});

describe("deepReadObject", () => {
  const obj = { a: { b: { c: "hello" } } };

  it("reads nested paths", () => {
    expect(deepReadObject(obj, "a.b.c")).toBe("hello");
  });

  it("returns default when missing", () => {
    expect(deepReadObject(obj, "a.b.d", "not found")).toBe("not found");
  });

  it("stops traversing once a segment is missing", () => {
    expect(deepReadObject(obj, "x.y.z", "fallback")).toBe("fallback");
    expect(deepReadObject(obj, "a.b.c.d.e")).toBeUndefined();
  });
});
