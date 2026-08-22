import { camel, snake } from "radashi";
import type { RequireAtLeastOne } from "type-fest";

/** A decoded JSON value: what an HTTP payload or `JSON.parse` result can hold. */
type JsonValue = JsonRecord | JsonValue[] | boolean | null | number | string;
interface JsonRecord {
  [key: string]: JsonValue | undefined;
}

const isJsonRecord = (value: JsonValue | undefined): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Clamps a value to a specified range.
 *
 * @example
 * clamp({ value: 12, min: 0, max: 10 }) // 10
 * clamp({ value: -5, min: 0, max: 10 }) // 0
 *
 * @param {object} options - options object
 * @param {number} options.value - value to clamp
 * @param {number} options.min - minimum value
 * @param {number} options.max - maximum value
 * @returns {number} clamped value
 */
export const clamp = ({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}): number => Math.min(Math.max(value, min), max);
const indonesianPhoneNumberFormatRegex =
  /(?<firstGroup>\d{3})(?<secondGroup>\d+)/u;
const indonesianPhoneNumberFormatRegex2 =
  /(?<firstGroup>\d{3})(?<secondGroup>\d{4})/u;
const indonesianPhoneNumberFormatRegex3 =
  /(?<firstGroup>\d{4})(?<secondGroup>\d{4})/u;
const indonesianPhoneNumberFormatRegex4 =
  /(?<firstGroup>\d{4})(?<secondGroup>\d{5,})/u;

/**
 * Format phone number based on mockup, currently only covered minimum 11 characters and max 15 characters include +62
 * e.g +62-812-7363-6365
 *
 * @param phoneNumber - input should include "+62"
 */
export const indonesianPhoneNumberFormat = (phoneNumber: string) => {
  // e.g: +62
  const code = phoneNumber.slice(0, 3);
  const numbers = phoneNumber.slice(3);
  // e.g 812, 852
  const ndc = numbers.slice(0, 3);
  // e.g the rest of the numbers
  const uniqNumber = numbers.slice(3);
  let regexp: RegExp;
  if (uniqNumber.length <= 6) {
    regexp = indonesianPhoneNumberFormatRegex;
  } else if (uniqNumber.length === 7) {
    regexp = indonesianPhoneNumberFormatRegex2;
  } else if (uniqNumber.length === 8) {
    regexp = indonesianPhoneNumberFormatRegex3;
  } else {
    regexp = indonesianPhoneNumberFormatRegex4;
  }
  const matches = uniqNumber.replace(regexp, "$1-$2");
  return [code, ndc, matches].join("-");
};

/** Rewrites every key of a decoded JSON value, leaving the leaves untouched. */
const mapKeysDeep = (
  value: JsonValue,
  mapKey: (key: string) => string
): JsonValue => {
  if (Array.isArray(value)) {
    return value.map((item) => mapKeysDeep(item, mapKey));
  }
  if (!isJsonRecord(value)) {
    return value;
  }
  const mapped: JsonRecord = {};
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) {
      mapped[mapKey(key)] = mapKeysDeep(entry, mapKey);
    }
  }
  return mapped;
};

/**
 * convert deep nested object keys to camelCase.
 */
export const toCamelCase = <T>(object: JsonValue): T =>
  // SAFETY: only keys are rewritten - the leaves keep their runtime values, so
  // `T` is the caller's snake_case-to-camelCase restatement of its own payload
  // type, which the traversal cannot express generically.
  mapKeysDeep(object, camel) as T;

/**
 * convert deep nested object keys to snake_case.
 */
export const toSnakeCase = <T>(object: JsonValue): T =>
  // SAFETY: only keys are rewritten - see `toCamelCase`.
  mapKeysDeep(object, snake) as T;

const removeLeadingZerosRegex = /^0+[1-9]+/u;
const removeLeadingZeroRegex = /^(?<group>0)/u;
const removeLeadingZeros2Regex = /^0{2,}/u;

/**
 * Remove leading zero
 */
export const removeLeadingZeros = (value: string) => {
  if (removeLeadingZerosRegex.test(value)) {
    return value.replace(removeLeadingZeroRegex, "");
  }
  return value.replace(removeLeadingZeros2Regex, "0");
};
const removeLeadingWhitespaceRegex = /^\s*$/u;
const removeLeadingWhitespace2Regex = /^\s*/u;

/**
 * Remove leading whitespaces
 */
export const removeLeadingWhitespace = (value?: string) => {
  if (!value) {
    return "";
  }
  if (removeLeadingWhitespaceRegex.test(value)) {
    return value.replace(removeLeadingWhitespace2Regex, "");
  }
  return value;
};

/** A value `FormData` can carry, or a container of such values. */
type FormDataValue =
  | Blob
  | Date
  | FormDataRecord
  | FormDataValue[]
  | boolean
  | null
  | number
  | string
  | undefined;
interface FormDataRecord {
  [key: string]: FormDataValue;
}
type FormDataAppend = (value: FormDataValue, rootName?: string) => void;

// Blob/Date land here too: they carry no own enumerable keys, so - as before -
// they are walked and contribute nothing.
const isWalkable = (value: FormDataValue): value is FormDataRecord =>
  typeof value === "object" && value !== null;

const appendObjectEntries = (
  obj: FormDataRecord,
  rootName: string,
  append: FormDataAppend
) => {
  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) {
      continue;
    }
    const nextRoot = rootName === "" ? key : `${rootName}.${key}`;
    append(obj[key], nextRoot);
  }
};

const appendFormDataValue = (
  formData: FormData,
  value: FormDataValue,
  rootName: string,
  append: FormDataAppend,
  arrayMode: "index" | "comma"
) => {
  if (value instanceof File) {
    formData.append(rootName, value);
    return;
  }
  if (Array.isArray(value)) {
    if (arrayMode === "comma") {
      formData.append(rootName, value.join(","));
      return;
    }
    for (let i = 0; i < value.length; i += 1) {
      append(value[i], `${rootName}[${i}]`);
    }
    return;
  }
  if (isWalkable(value)) {
    appendObjectEntries(value, rootName, append);
    return;
  }
  if (value !== null && value !== undefined) {
    formData.append(rootName, String(value));
  }
};

const createObjectToFormData =
  (arrayMode: "index" | "comma") =>
  <T extends FormDataRecord>(
    obj: T,
    options?: RequireAtLeastOne<{
      rootName?: string;
      ignoreList: (keyof T)[];
    }>
  ) => {
    const formData = new FormData();
    const ignore = (_key?: string) =>
      Array.isArray(options?.ignoreList) &&
      options.ignoreList.some((ignored) => ignored === _key);
    const appendFormData: FormDataAppend = (_obj, _rootName) => {
      if (ignore(_rootName)) {
        return;
      }
      appendFormDataValue(
        formData,
        _obj,
        _rootName || "",
        appendFormData,
        arrayMode
      );
    };
    appendFormData(obj, options?.rootName);
    return formData;
  };

/**
 * Convert deep object to FormData.
 * Supports File, array, and options to add object rootName and ignore object keys.
 *
 * @example
 *
 * const formData = objectToFormData({
 *   num: 1,
 *   falseBool: false,
 *   trueBool: true,
 *   empty: '',
 *   und: undefined,
 *   nullable: null,
 *   date: new Date(),
 *   file: new File(["foo"], "foo.txt", {
 *     type: "text/plain",
 *   }),
 *   name: 'str',
 *   another_object: {
 *     name: 'my_name',
 *     value: 'whatever'
 *   },
 *   array: [
 *     {
 *       nested_key1: {
 *         name: 'key1'
 *       }
 *     }
 *   ]
 * });
 *
 * // results
 * (2) ['num', '1']
 * (2) ['falseBool', 'false']
 * (2) ['trueBool', 'true']
 * (2) ['empty', '']
 * (2) ['file', File]
 * (2) ['name', 'str']
 * (2) ['another_object.name', 'my_name']
 * (2) ['another_object.value', 'whatever']
 * (2) ['array[0].nested_key1.name', 'key1']
 */
export const objectToFormData = createObjectToFormData("index");

/**
 * Convert deep object to FormData.
 * Supports File, array, and options to add object rootName and ignore object keys.
 *
 * @example
 *
 * const formData = objectToFormDataArrayWithComma({
 *   num: 1,
 *   falseBool: false,
 *   trueBool: true,
 *   empty: '',
 *   und: undefined,
 *   nullable: null,
 *   date: new Date(),
 *   file: new File(["foo"], "foo.txt", {
 *     type: "text/plain",
 *   }),
 *   name: 'str',
 *   another_object: {
 *     name: 'my_name',
 *     value: 'whatever'
 *   },
 *   array: [
 *     "value1",
 *     "value2"
 *   ]
 * });
 *
 * // results
 * (2) ['num', '1']
 * (2) ['falseBool', 'false']
 * (2) ['trueBool', 'true']
 * (2) ['empty', '']
 * (2) ['file', File]
 * (2) ['name', 'str']
 * (2) ['another_object.name', 'my_name']
 * (2) ['another_object.value', 'whatever']
 * (2) ['array', 'value1,value2']
 */
export const objectToFormDataArrayWithComma = createObjectToFormData("comma");

/**
 * Safely access deep values in an object via a string path seperated by `.`
 * This util is largely inspired by [dlv](https://github.com/developit/dlv/blob/master/index.js) and passes all its tests
 *
 * @param obj {Record<string, unknown>} - The object to parse
 * @param path {string} - The path to search in the object
 * @param [defaultValue] {unknown} -  A default value if the path doesn't exist in the object
 *
 * @returns {any} The value if found, the default provided value if set and not found, undefined otherwise
 *
 * @example
 *
 * ```js
 * const obj = { a: { b : { c: 'hello' } } };
 *
 * const value = deepReadObject(obj, 'a.b.c');
 * // => 'hello'
 * const notFound = deepReadObject(obj, 'a.b.d');
 * // => undefined
 * const notFound = deepReadObject(obj, 'a.b.d', 'not found');
 * // => 'not found'
 * ```
 */
export const deepReadObject = <T>(
  obj: JsonRecord,
  path: string,
  defaultValue?: T
): T | undefined => {
  let current: JsonValue | undefined = obj;
  for (const segment of path.trim().split(".")) {
    if (!isJsonRecord(current)) {
      current = undefined;
      break;
    }
    current = current[segment];
  }
  // SAFETY: the shape behind a runtime path string is unknowable here, so the
  // read site names the type it expects - the same contract as `defaultValue`.
  return current === undefined ? defaultValue : (current as T);
};
