import { fc, test } from "@fast-check/vitest";
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

// Helpers

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const digitsArb = fc.string({ unit: fc.constantFrom(...DIGITS) });

const nonZeroDigitArb = fc.constantFrom(...DIGITS.slice(1));

/** A `{ min, max }` pair with `min <= max`, built by sorting two doubles. */
const rangeArb = fc
  .tuple(fc.double({ noNaN: true }), fc.double({ noNaN: true }))
  .map(([a, b]) => (a <= b ? { min: a, max: b } : { min: b, max: a }));

const commaFreeStringArb = fc.string().map((text) => text.replaceAll(",", ""));

/** A JSON value that is not a record, so no key can be converted. */
const jsonLeafArb = fc.oneof(
  fc.string(),
  fc.double({ noNaN: true, noDefaultInfinity: true }),
  fc.boolean(),
  fc.constant(null)
);

/**
 * Lowercase words of two letters or more, joined by `_`: the shape the API sends.
 * Single-letter words do not round-trip: `a_a_a` → `aAA` → `a_aa`.
 */
const snakeKeyArb = fc
  .array(fc.stringMatching(/^[a-z]{2,}$/u), { minLength: 1 })
  .map((words) => words.join("_"));

/** A path segment: no `.`, which separates segments, and no outer space, which the path trim removes. */
const pathSegmentArb = fc
  .string()
  .map((text) => text.replaceAll(".", "").trim());

/** `{ first: { …rest: leaf } }`, the record that a dotted path reads. */
const nestAt = (first: string, rest: string[], leaf: fc.JsonValue) => {
  let inner = leaf;

  for (const segment of rest.toReversed()) {
    inner = { [segment]: inner };
  }

  return { [first]: inner };
};

describe("clamp", () => {
  it("should return the max when the value is above it", () => {
    // Arrange
    const range = { min: 0, max: 10 };

    // Act
    const clamped = clamp({ value: 12, ...range });

    // Assert
    expect(clamped).toBe(10);
  });

  it("should return the min when the value is below it", () => {
    // Arrange
    const range = { min: 0, max: 10 };

    // Act
    const clamped = clamp({ value: -5, ...range });

    // Assert
    expect(clamped).toBe(0);
  });

  it("should return the value when it is in range", () => {
    // Arrange
    const range = { min: 0, max: 10 };

    // Act
    const clamped = clamp({ value: 5, ...range });

    // Assert
    expect(clamped).toBe(5);
  });

  test.prop([fc.double({ noNaN: true }), rangeArb])(
    "should always return a number inside the range",
    (value, { min, max }) => {
      // Arrange
      const options = { value, min, max };

      // Act
      const clamped = clamp(options);

      // Assert
      expect(clamped).toBeGreaterThanOrEqual(min);
      expect(clamped).toBeLessThanOrEqual(max);
    }
  );

  test.prop([fc.double({ noNaN: true }), rangeArb])(
    "should be idempotent",
    (value, range) => {
      // Arrange
      const once = clamp({ value, ...range });

      // Act
      const twice = clamp({ value: once, ...range });

      // Assert
      expect(twice).toBe(once);
    }
  );
});

describe("indonesianPhoneNumberFormat", () => {
  it("should format a +62 number", () => {
    // Arrange
    const phoneNumber = "+6281273636365";

    // Act
    const formatted = indonesianPhoneNumberFormat(phoneNumber);

    // Assert
    expect(formatted).toBe("+62-812-7363-6365");
  });

  it("should pick a grouping for each subscriber-number length", () => {
    // Arrange
    const cases = [
      // 6 digits or fewer
      ["+62812363636", "+62-812-363-636"],
      // 7 digits
      ["+628123636365", "+62-812-363-6365"],
      // 9 digits and up
      ["+62812736363651", "+62-812-7363-63651"],
    ] as const;

    for (const [phoneNumber, expected] of cases) {
      // Act
      const formatted = indonesianPhoneNumberFormat(phoneNumber);

      // Assert
      expect(formatted).toBe(expected);
    }
  });

  test.prop([digitsArb])("should never add or remove a digit", (digits) => {
    // Arrange
    const phoneNumber = `+62${digits}`;

    // Act
    const formatted = indonesianPhoneNumberFormat(phoneNumber);

    // Assert
    expect(formatted.startsWith("+62-")).toBe(true);
    expect(formatted.replaceAll("-", "")).toBe(phoneNumber);
  });
});

describe("toCamelCase", () => {
  it("should convert nested snake_case keys to camelCase", () => {
    // Arrange
    const payload = { first_name: "Ada", nested: { last_name: "Lovelace" } };

    // Act
    const converted = toCamelCase(payload);

    // Assert
    expect(converted).toEqual({
      firstName: "Ada",
      nested: { lastName: "Lovelace" },
    });
  });

  it("should convert the records inside an array", () => {
    // Arrange
    const payload = [{ user_id: 1 }];

    // Act
    const converted = toCamelCase(payload);

    // Assert
    expect(converted).toEqual([{ userId: 1 }]);
  });

  it("should drop keys whose value is undefined", () => {
    // Arrange
    const payload = { first_name: "Ada", middle_name: undefined };

    // Act
    const converted = toCamelCase(payload);

    // Assert
    expect(converted).toEqual({ firstName: "Ada" });
  });

  test.prop([fc.array(jsonLeafArb)])(
    "should never change a value that holds no record",
    (leaves) => {
      // Arrange
      const payload = leaves;

      // Act
      const converted = toCamelCase(payload);

      // Assert
      expect(converted).toEqual(leaves);
    }
  );
});

describe("toSnakeCase", () => {
  it("should convert nested camelCase keys to snake_case", () => {
    // Arrange
    const payload = { firstName: "Ada", nested: { lastName: "Lovelace" } };

    // Act
    const converted = toSnakeCase(payload);

    // Assert
    expect(converted).toEqual({
      first_name: "Ada",
      nested: { last_name: "Lovelace" },
    });
  });

  it("should convert the records inside an array", () => {
    // Arrange
    const payload = [{ userId: 1 }];

    // Act
    const converted = toSnakeCase(payload);

    // Assert
    expect(converted).toEqual([{ user_id: 1 }]);
  });

  it("should drop keys whose value is undefined", () => {
    // Arrange
    const payload = { firstName: "Ada", middleName: undefined };

    // Act
    const converted = toSnakeCase(payload);

    // Assert
    expect(converted).toEqual({ first_name: "Ada" });
  });

  test.prop([fc.array(jsonLeafArb)])(
    "should never change a value that holds no record",
    (leaves) => {
      // Arrange
      const payload = leaves;

      // Act
      const converted = toSnakeCase(payload);

      // Assert
      expect(converted).toEqual(leaves);
    }
  );

  test.prop([snakeKeyArb, jsonLeafArb])(
    "should restore a snake_case key that toCamelCase converted",
    (key, value) => {
      // Arrange
      const camel = toCamelCase({ [key]: value });

      // Act
      const snake = toSnakeCase(camel);

      // Assert
      expect(snake).toEqual({ [key]: value });
    }
  );
});

describe("removeLeadingZeros", () => {
  it("should strip a single leading zero before a non-zero digit", () => {
    // Arrange
    const value = "0123";

    // Act
    const stripped = removeLeadingZeros(value);

    // Assert
    expect(stripped).toBe("123");
  });

  it("should strip every leading zero before a non-zero digit", () => {
    // Arrange
    const value = "00123";

    // Act
    const stripped = removeLeadingZeros(value);

    // Assert
    expect(stripped).toBe("123");
  });

  it("should collapse a run of zeros to one zero", () => {
    // Arrange
    const value = "000";

    // Act
    const stripped = removeLeadingZeros(value);

    // Assert
    expect(stripped).toBe("0");
  });

  test.prop([nonZeroDigitArb, digitsArb])(
    "should never change a value that starts with a non-zero digit",
    (first, rest) => {
      // Arrange
      const value = `${first}${rest}`;

      // Act
      const stripped = removeLeadingZeros(value);

      // Assert
      expect(stripped).toBe(value);
    }
  );
  test.prop([
    fc.string({ unit: fc.constant("0") }),
    nonZeroDigitArb,
    digitsArb,
  ])(
    "should never leave a zero before the first non-zero digit",
    (zeros, first, rest) => {
      // Arrange
      const value = `${zeros}${first}${rest}`;

      // Act
      const stripped = removeLeadingZeros(value);

      // Assert
      expect(stripped).toBe(`${first}${rest}`);
    }
  );
});

describe("removeLeadingWhitespace", () => {
  it("should return an empty string for undefined", () => {
    // Arrange
    const value = undefined;

    // Act
    const stripped = removeLeadingWhitespace(value);

    // Assert
    expect(stripped).toBe("");
  });

  it("should strip a whitespace-only string", () => {
    // Arrange
    const value = "   ";

    // Act
    const stripped = removeLeadingWhitespace(value);

    // Assert
    expect(stripped).toBe("");
  });

  it("should leave a string with text unchanged", () => {
    // Arrange
    const value = "  hi";

    // Act
    const stripped = removeLeadingWhitespace(value);

    // Assert
    expect(stripped).toBe("  hi");
  });

  test.prop([fc.string({ unit: fc.constantFrom(" ", "\t", "\n", "\r") })])(
    "should always return an empty string for whitespace only",
    (value) => {
      // Act
      const stripped = removeLeadingWhitespace(value);

      // Assert
      expect(stripped).toBe("");
    }
  );

  test.prop([fc.string(), fc.constantFrom("a", "0", "-", "é"), fc.string()])(
    "should never change a string that holds a non-whitespace character",
    (before, text, after) => {
      // Arrange
      const value = `${before}${text}${after}`;

      // Act
      const stripped = removeLeadingWhitespace(value);

      // Assert
      expect(stripped).toBe(value);
    }
  );
});

describe("objectToFormData", () => {
  it("should flatten nested objects and arrays", () => {
    // Arrange
    const payload = {
      num: 1,
      name: "str",
      nested: { key: "v" },
      array: [{ nested_key1: { name: "key1" } }],
    };

    // Act
    const formData = objectToFormData(payload);

    // Assert
    expect(Object.fromEntries(formData)).toEqual({
      num: "1",
      name: "str",
      "nested.key": "v",
      "array[0].nested_key1.name": "key1",
    });
  });

  it("should skip the keys in the ignore list", () => {
    // Arrange
    const payload = { keep: "a", drop: "b" };

    // Act
    const formData = objectToFormData(payload, { ignoreList: ["drop"] });

    // Assert
    expect(Object.fromEntries(formData)).toEqual({ keep: "a" });
  });

  it("should append a File value as it is", () => {
    // Arrange
    const file = new File(["hi"], "hi.txt", { type: "text/plain" });

    // Act
    const formData = objectToFormData({ avatar: file });

    // Assert
    const avatar = formData.get("avatar");
    expect(avatar).toBeInstanceOf(File);
    expect(avatar instanceof File ? avatar.name : undefined).toBe("hi.txt");
  });

  it("should skip null and undefined leaves", () => {
    // Arrange
    const payload = { empty: null, missing: undefined, kept: "yes" };

    // Act
    const formData = objectToFormData(payload);

    // Assert
    expect(Object.fromEntries(formData)).toEqual({ kept: "yes" });
  });

  it("should skip inherited enumerable properties", () => {
    // Arrange
    // SAFETY: `Object.create` returns `any`; the prototype and the own property
    // assigned below are both string-valued, which is what the walk reads.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const nested = Object.create({ inherited: "no" }) as Record<string, string>;
    nested.own = "yes";

    // Act
    const formData = objectToFormData({ nested });

    // Assert
    expect(Object.fromEntries(formData)).toEqual({ "nested.own": "yes" });
  });

  test.prop([fc.dictionary(fc.string(), fc.string())])(
    "should append one entry for each string leaf of a flat record",
    (payload) => {
      // Act
      const formData = objectToFormData(payload);

      // Assert
      expect(Object.fromEntries(formData)).toEqual({ ...payload });
    }
  );
});

describe("objectToFormDataArrayWithComma", () => {
  it("should join a string array with commas", () => {
    // Arrange
    const payload = { filters: ["model", "category"] };

    // Act
    const formData = objectToFormDataArrayWithComma(payload);

    // Assert
    expect(formData.get("filters")).toBe("model,category");
  });

  test.prop([fc.array(commaFreeStringArb, { minLength: 1 })])(
    "should send every item of a comma-free string array, in order",
    (filters) => {
      // Act
      const formData = objectToFormDataArrayWithComma({ filters });

      // Assert
      expect(formData.get("filters")).toBe(filters.join(","));
    }
  );
});

describe("deepReadObject", () => {
  it("should read a nested path", () => {
    // Arrange
    const payload = { a: { b: { c: "hello" } } };

    // Act
    const value = deepReadObject(payload, "a.b.c");

    // Assert
    expect(value).toBe("hello");
  });

  it("should return the default value when the path is missing", () => {
    // Arrange
    const payload = { a: { b: { c: "hello" } } };

    // Act
    const value = deepReadObject(payload, "a.b.d", "not found");

    // Assert
    expect(value).toBe("not found");
  });

  it("should stop at the first missing segment", () => {
    // Arrange
    const payload = { a: { b: { c: "hello" } } };

    // Act
    const pastLeaf = deepReadObject(payload, "a.b.c.d.e");
    const pastRoot = deepReadObject(payload, "x.y.z", "fallback");

    // Assert
    expect(pastLeaf).toBeUndefined();
    expect(pastRoot).toBe("fallback");
  });

  test.prop([pathSegmentArb, fc.array(pathSegmentArb), fc.jsonValue()])(
    "should always read back the value stored at a dotted path",
    (first, rest, leaf) => {
      // Arrange
      const payload = nestAt(first, rest, leaf);

      // Act
      const value = deepReadObject(payload, [first, ...rest].join("."));

      // Assert
      expect(value).toEqual(leaf);
    }
  );
});
