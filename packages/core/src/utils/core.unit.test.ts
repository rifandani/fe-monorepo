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

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

const digitsArb = fc.string({ unit: fc.constantFrom(...DIGITS) });

const nonZeroDigitArb = fc.constantFrom(...DIGITS.slice(1));

const rangeArb = fc
  .tuple(fc.double({ noNaN: true }), fc.double({ noNaN: true }))
  .map(([a, b]) => (a <= b ? { min: a, max: b } : { min: b, max: a }));

const commaFreeStringArb = fc.string().map((text) => text.replaceAll(",", ""));

const jsonLeafArb = fc.oneof(
  fc.string(),
  fc.double({ noNaN: true, noDefaultInfinity: true }),
  fc.boolean(),
  fc.constant(null)
);

const snakeKeyArb = fc
  .array(fc.stringMatching(/^[a-z]{2,}$/u), { minLength: 1 })
  .map((words) => words.join("_"));

const pathSegmentArb = fc
  .string()
  .map((text) => text.replaceAll(".", "").trim());

const nestAt = (first: string, rest: string[], leaf: fc.JsonValue) => {
  let inner = leaf;

  for (const segment of rest.toReversed()) {
    inner = { [segment]: inner };
  }

  return { [first]: inner };
};

describe("clamp", () => {
  it("should return the max when the value is above it", () => {
    const range = { min: 0, max: 10 };

    const clamped = clamp({ value: 12, ...range });

    expect(clamped).toBe(10);
  });

  it("should return the min when the value is below it", () => {
    const range = { min: 0, max: 10 };

    const clamped = clamp({ value: -5, ...range });

    expect(clamped).toBe(0);
  });

  it("should return the value when it is in range", () => {
    const range = { min: 0, max: 10 };

    const clamped = clamp({ value: 5, ...range });

    expect(clamped).toBe(5);
  });

  test.prop([fc.double({ noNaN: true }), rangeArb])(
    "should always return a number inside the range",
    (value, { min, max }) => {
      const options = { value, min, max };

      const clamped = clamp(options);

      expect(clamped).toBeGreaterThanOrEqual(min);
      expect(clamped).toBeLessThanOrEqual(max);
    }
  );

  test.prop([fc.double({ noNaN: true }), rangeArb])(
    "should be idempotent",
    (value, range) => {
      const once = clamp({ value, ...range });

      const twice = clamp({ value: once, ...range });

      expect(twice).toBe(once);
    }
  );
});

describe("indonesianPhoneNumberFormat", () => {
  it("should format a +62 number", () => {
    const phoneNumber = "+6281273636365";

    const formatted = indonesianPhoneNumberFormat(phoneNumber);

    expect(formatted).toBe("+62-812-7363-6365");
  });

  it("should pick a grouping for each subscriber-number length", () => {
    const cases = [
      ["+62812363636", "+62-812-363-636"],
      ["+628123636365", "+62-812-363-6365"],
      ["+62812736363651", "+62-812-7363-63651"],
    ] as const;

    for (const [phoneNumber, expected] of cases) {
      const formatted = indonesianPhoneNumberFormat(phoneNumber);

      expect(formatted).toBe(expected);
    }
  });

  test.prop([digitsArb])("should never add or remove a digit", (digits) => {
    const phoneNumber = `+62${digits}`;

    const formatted = indonesianPhoneNumberFormat(phoneNumber);

    expect(formatted.startsWith("+62-")).toBe(true);
    expect(formatted.replaceAll("-", "")).toBe(phoneNumber);
  });
});

describe("toCamelCase", () => {
  it("should convert nested snake_case keys to camelCase", () => {
    const payload = { first_name: "Ada", nested: { last_name: "Lovelace" } };

    const converted = toCamelCase(payload);

    expect(converted).toEqual({
      firstName: "Ada",
      nested: { lastName: "Lovelace" },
    });
  });

  it("should convert the records inside an array", () => {
    const payload = [{ user_id: 1 }];

    const converted = toCamelCase(payload);

    expect(converted).toEqual([{ userId: 1 }]);
  });

  it("should drop keys whose value is undefined", () => {
    const payload = { first_name: "Ada", middle_name: undefined };

    const converted = toCamelCase(payload);

    expect(converted).toEqual({ firstName: "Ada" });
  });

  test.prop([fc.array(jsonLeafArb)])(
    "should never change a value that holds no record",
    (leaves) => {
      const payload = leaves;

      const converted = toCamelCase(payload);

      expect(converted).toEqual(leaves);
    }
  );
});

describe("toSnakeCase", () => {
  it("should convert nested camelCase keys to snake_case", () => {
    const payload = { firstName: "Ada", nested: { lastName: "Lovelace" } };

    const converted = toSnakeCase(payload);

    expect(converted).toEqual({
      first_name: "Ada",
      nested: { last_name: "Lovelace" },
    });
  });

  it("should convert the records inside an array", () => {
    const payload = [{ userId: 1 }];

    const converted = toSnakeCase(payload);

    expect(converted).toEqual([{ user_id: 1 }]);
  });

  it("should drop keys whose value is undefined", () => {
    const payload = { firstName: "Ada", middleName: undefined };

    const converted = toSnakeCase(payload);

    expect(converted).toEqual({ first_name: "Ada" });
  });

  test.prop([fc.array(jsonLeafArb)])(
    "should never change a value that holds no record",
    (leaves) => {
      const payload = leaves;

      const converted = toSnakeCase(payload);

      expect(converted).toEqual(leaves);
    }
  );

  test.prop([snakeKeyArb, jsonLeafArb])(
    "should restore a snake_case key that toCamelCase converted",
    (key, value) => {
      const camel = toCamelCase({ [key]: value });

      const snake = toSnakeCase(camel);

      expect(snake).toEqual({ [key]: value });
    }
  );
});

describe("removeLeadingZeros", () => {
  it("should strip a single leading zero before a non-zero digit", () => {
    const value = "0123";

    const stripped = removeLeadingZeros(value);

    expect(stripped).toBe("123");
  });

  it("should strip every leading zero before a non-zero digit", () => {
    const value = "00123";

    const stripped = removeLeadingZeros(value);

    expect(stripped).toBe("123");
  });

  it("should collapse a run of zeros to one zero", () => {
    const value = "000";

    const stripped = removeLeadingZeros(value);

    expect(stripped).toBe("0");
  });

  test.prop([nonZeroDigitArb, digitsArb])(
    "should never change a value that starts with a non-zero digit",
    (first, rest) => {
      const value = `${first}${rest}`;

      const stripped = removeLeadingZeros(value);

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
      const value = `${zeros}${first}${rest}`;

      const stripped = removeLeadingZeros(value);

      expect(stripped).toBe(`${first}${rest}`);
    }
  );
});

describe("removeLeadingWhitespace", () => {
  it("should return an empty string for undefined", () => {
    const value = undefined;

    const stripped = removeLeadingWhitespace(value);

    expect(stripped).toBe("");
  });

  it("should strip a whitespace-only string", () => {
    const value = "   ";

    const stripped = removeLeadingWhitespace(value);

    expect(stripped).toBe("");
  });

  it("should leave a string with text unchanged", () => {
    const value = "  hi";

    const stripped = removeLeadingWhitespace(value);

    expect(stripped).toBe("  hi");
  });

  test.prop([fc.string({ unit: fc.constantFrom(" ", "\t", "\n", "\r") })])(
    "should always return an empty string for whitespace only",
    (value) => {
      const stripped = removeLeadingWhitespace(value);

      expect(stripped).toBe("");
    }
  );

  test.prop([fc.string(), fc.constantFrom("a", "0", "-", "é"), fc.string()])(
    "should never change a string that holds a non-whitespace character",
    (before, text, after) => {
      const value = `${before}${text}${after}`;

      const stripped = removeLeadingWhitespace(value);

      expect(stripped).toBe(value);
    }
  );
});

describe("objectToFormData", () => {
  it("should flatten nested objects and arrays", () => {
    const payload = {
      num: 1,
      name: "str",
      nested: { key: "v" },
      array: [{ nested_key1: { name: "key1" } }],
    };

    const formData = objectToFormData(payload);

    expect(Object.fromEntries(formData)).toEqual({
      num: "1",
      name: "str",
      "nested.key": "v",
      "array[0].nested_key1.name": "key1",
    });
  });

  it("should skip the keys in the ignore list", () => {
    const payload = { keep: "a", drop: "b" };

    const formData = objectToFormData(payload, { ignoreList: ["drop"] });

    expect(Object.fromEntries(formData)).toEqual({ keep: "a" });
  });

  it("should append a File value as it is", () => {
    const file = new File(["hi"], "hi.txt", { type: "text/plain" });

    const formData = objectToFormData({ avatar: file });

    const avatar = formData.get("avatar");
    expect(avatar).toBeInstanceOf(File);
    expect(avatar instanceof File ? avatar.name : undefined).toBe("hi.txt");
  });

  it("should skip null and undefined leaves", () => {
    const payload = { empty: null, missing: undefined, kept: "yes" };

    const formData = objectToFormData(payload);

    expect(Object.fromEntries(formData)).toEqual({ kept: "yes" });
  });

  it("should skip inherited enumerable properties", () => {
    const nested = { own: "yes" };
    Object.setPrototypeOf(nested, { inherited: "no" });

    const formData = objectToFormData({ nested });

    expect(Object.fromEntries(formData)).toEqual({ "nested.own": "yes" });
  });

  test.prop([fc.dictionary(fc.string(), fc.string())])(
    "should append one entry for each string leaf of a flat record",
    (payload) => {
      const formData = objectToFormData(payload);

      expect(Object.fromEntries(formData)).toEqual({ ...payload });
    }
  );
});

describe("objectToFormDataArrayWithComma", () => {
  it("should join a string array with commas", () => {
    const payload = { filters: ["model", "category"] };

    const formData = objectToFormDataArrayWithComma(payload);

    expect(formData.get("filters")).toBe("model,category");
  });

  test.prop([fc.array(commaFreeStringArb, { minLength: 1 })])(
    "should send every item of a comma-free string array, in order",
    (filters) => {
      const formData = objectToFormDataArrayWithComma({ filters });

      expect(formData.get("filters")).toBe(filters.join(","));
    }
  );
});

describe("deepReadObject", () => {
  it("should read a nested path", () => {
    const payload = { a: { b: { c: "hello" } } };

    const value = deepReadObject(payload, "a.b.c");

    expect(value).toBe("hello");
  });

  it("should return the default value when the path is missing", () => {
    const payload = { a: { b: { c: "hello" } } };

    const value = deepReadObject(payload, "a.b.d", "not found");

    expect(value).toBe("not found");
  });

  it("should stop at the first missing segment", () => {
    const payload = { a: { b: { c: "hello" } } };

    const pastLeaf = deepReadObject(payload, "a.b.c.d.e");
    const pastRoot = deepReadObject(payload, "x.y.z", "fallback");

    expect(pastLeaf).toBeUndefined();
    expect(pastRoot).toBe("fallback");
  });

  test.prop([pathSegmentArb, fc.array(pathSegmentArb), fc.jsonValue()])(
    "should always read back the value stored at a dotted path",
    (first, rest, leaf) => {
      const payload = nestAt(first, rest, leaf);

      const value = deepReadObject(payload, [first, ...rest].join("."));

      expect(value).toEqual(leaf);
    }
  );
});
