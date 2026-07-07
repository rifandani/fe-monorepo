/* oxlint-disable eslint/func-style -- function declarations */
import type { RequireAtLeastOne, UnknownRecord } from "type-fest";

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
export function clamp({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}): number {
  return Math.min(Math.max(value, min), max);
}
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
export function indonesianPhoneNumberFormat(phoneNumber: string) {
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
}
const replaceCamelCaseRegex = /\.?(?<group>[A-Z]+)/gu;
const replaceCamelCaseRegex2 = /^_/u;
const replaceCamelCaseRegex3 = /(?<group>_\w)|(?<group>-\w)/gu;

/**
 * convert deep nested object keys to camelCase.
 */
export function toCamelCase<T>(object: unknown): T {
  let transformedObject = object as Record<string, unknown>;
  if (typeof object === "object" && object !== null) {
    if (Array.isArray(object)) {
      transformedObject = object.map(toCamelCase) as unknown as Record<
        string,
        unknown
      >;
    } else {
      transformedObject = {};
      for (const key of Object.keys(object)) {
        if ((object as Record<string, unknown>)[key] !== undefined) {
          const firstUnderscore = key.replace(replaceCamelCaseRegex2, "");
          const newKey = firstUnderscore.replace(replaceCamelCaseRegex3, (k) =>
            (k[1] as string).toUpperCase()
          );
          transformedObject[newKey] = toCamelCase(
            (object as Record<string, unknown>)[key]
          );
        }
      }
    }
  }
  return transformedObject as T;
}
export function toSnakeCase<T>(object: unknown): T {
  let transformedObject = object as Record<string, unknown>;
  if (typeof object === "object" && object !== null) {
    if (Array.isArray(object)) {
      transformedObject = object.map(toSnakeCase) as unknown as Record<
        string,
        unknown
      >;
    } else {
      transformedObject = {};
      for (const key of Object.keys(object)) {
        if ((object as Record<string, unknown>)[key] !== undefined) {
          const newKey = key
            .replace(
              replaceCamelCaseRegex,
              (_, y) => `_${y ? (y as string).toLowerCase() : ""}`
            )
            .replace(replaceCamelCaseRegex2, "");
          transformedObject[newKey] = toSnakeCase(
            (object as Record<string, unknown>)[key]
          );
        }
      }
    }
  }
  return transformedObject as T;
}
const removeLeadingZerosRegex = /^0+[1-9]+/u;
const removeLeadingZeroRegex = /^(?<group>0)/u;
const removeLeadingZeros2Regex = /^0{2,}/u;

/**
 * Remove leading zero
 */
export function removeLeadingZeros(value: string) {
  if (removeLeadingZerosRegex.test(value)) {
    return value.replace(removeLeadingZeroRegex, "");
  }
  return value.replace(removeLeadingZeros2Regex, "0");
}
const removeLeadingWhitespaceRegex = /^\s*$/u;
const removeLeadingWhitespace2Regex = /^\s*/u;

/**
 * Remove leading whitespaces
 */
export function removeLeadingWhitespace(value?: string) {
  if (!value) {
    return "";
  }
  if (removeLeadingWhitespaceRegex.test(value)) {
    return value.replace(removeLeadingWhitespace2Regex, "");
  }
  return value;
}

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
export function objectToFormData<T extends UnknownRecord>(
  obj: T,
  options?: RequireAtLeastOne<{
    rootName?: string;
    ignoreList: (keyof T)[];
  }>
) {
  const formData = new FormData();
  function ignore(_key?: string) {
    return (
      Array.isArray(options?.ignoreList) &&
      options?.ignoreList.includes(_key as keyof T)
    );
  }
  function appendFormData(_obj: T, _rootName?: string) {
    let newRootName = _rootName;
    if (!ignore(newRootName)) {
      newRootName ||= "";
      if (_obj instanceof File) {
        formData.append(newRootName, _obj);
      } else if (Array.isArray(_obj)) {
        for (let i = 0; i < _obj.length; i += 1) {
          appendFormData(_obj[i], `${newRootName}[${i}]`);
        }
      } else if (typeof _obj === "object" && _obj) {
        for (const key in _obj) {
          if (Object.hasOwn(_obj, key)) {
            if (newRootName === "") {
              // @ts-expect-error i'm not typescript wizard
              appendFormData(_obj[key], key);
            } else {
              // @ts-expect-error i'm not typescript wizard
              appendFormData(_obj[key], `${newRootName}.${key}`);
            }
          }
        }
      } else {
        if (_obj !== null && _obj !== undefined) {
          formData.append(newRootName, _obj);
        }
      }
    }
  }
  appendFormData(obj, options?.rootName);
  return formData;
}

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
export function objectToFormDataArrayWithComma<T extends UnknownRecord>(
  obj: T,
  options?: RequireAtLeastOne<{
    rootName?: string;
    ignoreList: (keyof T)[];
  }>
) {
  const formData = new FormData();
  // oxlint-disable-next-line sonarjs/no-identical-functions -- shared ignore helper per FormData converter
  function ignore(_key?: string) {
    return (
      Array.isArray(options?.ignoreList) &&
      options?.ignoreList.includes(_key as keyof T)
    );
  }
  function appendFormData(_obj: T, _rootName?: string) {
    let newRootName = _rootName;
    if (!ignore(newRootName)) {
      newRootName ||= "";
      if (_obj instanceof File) {
        formData.append(newRootName, _obj);
      } else if (Array.isArray(_obj)) {
        formData.append(newRootName, _obj.join(","));
      } else if (typeof _obj === "object" && _obj) {
        for (const key in _obj) {
          if (Object.hasOwn(_obj, key)) {
            if (newRootName === "") {
              // @ts-expect-error i'm not typescript wizard
              appendFormData(_obj[key], key);
            } else {
              // @ts-expect-error i'm not typescript wizard
              appendFormData(_obj[key], `${newRootName}.${key}`);
            }
          }
        }
      } else {
        if (_obj !== null && _obj !== undefined) {
          formData.append(newRootName, _obj);
        }
      }
    }
  }
  appendFormData(obj, options?.rootName);
  return formData;
}

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
// oxlint-disable-next-line typescript/no-explicit-any
export function deepReadObject<T = any>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: unknown
): T {
  const value = path
    .trim()
    .split(".")
    // oxlint-disable-next-line typescript/no-explicit-any -- dynamic path traversal
    .reduce<any>((a, b) => (a ? a[b] : undefined), obj);
  return value === undefined ? (defaultValue as T) : value;
}

/**
 * Converts a File object to a base64 encoded string
 * @param file - The File object to convert
 * @returns Promise that resolves with the base64 string representation of the file
 */
export function toBase64(file: File) {
  // oxlint-disable-next-line promise/avoid-new -- FileReader has no promise API
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // oxlint-disable-next-line unicorn/prefer-add-event-listener -- FileReader API
    reader.onload = () => resolve(reader.result);
    // oxlint-disable-next-line unicorn/prefer-add-event-listener -- FileReader API
    reader.onerror = reject;
  });
}
