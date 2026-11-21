import { camel, snake } from "radashi";
import type { RequireAtLeastOne } from "type-fest";

type JsonValue = JsonRecord | JsonValue[] | boolean | null | number | string;

interface JsonRecord {
  [key: string]: JsonValue | undefined;
}

const isJsonRecord = (value: JsonValue | undefined): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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

export const indonesianPhoneNumberFormat = (phoneNumber: string) => {
  const code = phoneNumber.slice(0, 3);
  const numbers = phoneNumber.slice(3);
  const ndc = numbers.slice(0, 3);
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

export const toCamelCase = (object: JsonValue): JsonValue =>
  mapKeysDeep(object, camel);

export const toSnakeCase = (object: JsonValue): JsonValue =>
  mapKeysDeep(object, snake);

const zerosBeforeDigitRegex = /^0+(?=[1-9])/u;
const zeroRunRegex = /^0{2,}/u;

export const removeLeadingZeros = (value: string) => {
  if (zerosBeforeDigitRegex.test(value)) {
    return value.replace(zerosBeforeDigitRegex, "");
  }

  return value.replace(zeroRunRegex, "0");
};

const removeLeadingWhitespaceRegex = /^\s*$/u;
const removeLeadingWhitespace2Regex = /^\s*/u;

export const removeLeadingWhitespace = (value?: string) => {
  if (value === undefined || value === "") {
    return "";
  }

  if (removeLeadingWhitespaceRegex.test(value)) {
    return value.replace(removeLeadingWhitespace2Regex, "");
  }

  return value;
};

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

const isWalkable = (value: FormDataValue): value is FormDataRecord =>
  typeof value === "object" && value !== null;

const isLeaf = (value: FormDataValue): value is boolean | number | string =>
  typeof value !== "object" && value !== undefined;

const toCommaItem = (item: FormDataValue) =>
  isLeaf(item) || item instanceof Date ? String(item) : "";

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
      formData.append(rootName, value.map(toCommaItem).join(","));

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

  if (isLeaf(value)) {
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
        _rootName ?? "",
        appendFormData,
        arrayMode
      );
    };

    appendFormData(obj, options?.rootName);

    return formData;
  };

export const objectToFormData = createObjectToFormData("index");

export const objectToFormDataArrayWithComma = createObjectToFormData("comma");

export const deepReadObject = (
  obj: JsonRecord,
  path: string,
  defaultValue?: JsonValue
): JsonValue | undefined => {
  let current: JsonValue | undefined = obj;

  for (const segment of path.trim().split(".")) {
    if (!isJsonRecord(current)) {
      current = undefined;
      break;
    }

    current = current[segment];
  }

  return current === undefined ? defaultValue : current;
};
