import type { ParamOptions } from "@workspace/core/libs/i18n/define-translation";

const substitutePlural = (
  locale: string,
  result: string,
  replaceKey: string,
  argKey: string,
  argValue: unknown,
  translationParams: ParamOptions
): string => {
  if (typeof argValue !== "number") {
    throw new TypeError("Invalid argument");
  }
  const pluralMap = translationParams.plural?.[argKey];
  const pluralRules = new Intl.PluralRules(locale, { type: pluralMap?.type });
  const replacement =
    pluralMap?.[pluralRules.select(argValue)] ?? pluralMap?.other;
  if (replacement === null || replacement === undefined) {
    throw new Error("Missing replacement value");
  }
  const numberFormatter = new Intl.NumberFormat(
    locale,
    translationParams.plural?.[argKey]?.formatter
  );
  return result.replace(
    replaceKey,
    replacement.replace(`{?}`, numberFormatter.format(argValue))
  );
};

const substituteEnum = (
  result: string,
  replaceKey: string,
  argKey: string,
  argValue: unknown,
  translationParams: ParamOptions
): string => {
  if (typeof argValue !== "string") {
    throw new TypeError("Invalid argument");
  }
  const enumMap = translationParams.enum?.[argKey];
  const replacement = enumMap?.[argValue];
  if (replacement === null || replacement === undefined) {
    throw new Error("Missing replacement value");
  }
  return result.replace(replaceKey, replacement);
};

const substituteNumber = (
  locale: string,
  result: string,
  replaceKey: string,
  argKey: string,
  argValue: unknown,
  translationParams: ParamOptions
): string => {
  if (typeof argValue !== "number") {
    throw new TypeError("Invalid argument");
  }
  const numberFormat = new Intl.NumberFormat(
    locale,
    translationParams.number?.[argKey]
  );
  return result.replace(replaceKey, numberFormat.format(argValue));
};

const substituteList = (
  locale: string,
  result: string,
  replaceKey: string,
  argKey: string,
  argValue: unknown,
  translationParams: ParamOptions
): string => {
  if (!Array.isArray(argValue)) {
    throw new TypeError("Invalid argument");
  }
  const formatter = new Intl.ListFormat(
    locale,
    translationParams.list?.[argKey]
  );
  return result.replace(replaceKey, formatter.format(argValue));
};

const substituteDate = (
  locale: string,
  result: string,
  replaceKey: string,
  argKey: string,
  argValue: unknown,
  translationParams: ParamOptions
): string => {
  if (!(argValue instanceof Date)) {
    throw new Error("Invalid argument");
  }
  const dateFormat = new Intl.DateTimeFormat(
    locale,
    translationParams.date?.[argKey]
  );
  return result.replace(replaceKey, dateFormat.format(argValue));
};

export const substituteArg = (
  locale: string,
  result: string,
  argKey: string,
  argValue: unknown,
  translationParams: ParamOptions
): string => {
  const match = result.match(`{${argKey}:?([^}]*)?}`);
  const [replaceKey, argType] = match ?? [`{${argKey}}`, undefined];
  switch (argType) {
    case "plural": {
      return substitutePlural(
        locale,
        result,
        replaceKey,
        argKey,
        argValue,
        translationParams
      );
    }
    case "enum": {
      return substituteEnum(
        result,
        replaceKey,
        argKey,
        argValue,
        translationParams
      );
    }
    case "number": {
      return substituteNumber(
        locale,
        result,
        replaceKey,
        argKey,
        argValue,
        translationParams
      );
    }
    case "list": {
      return substituteList(
        locale,
        result,
        replaceKey,
        argKey,
        argValue,
        translationParams
      );
    }
    case "date": {
      return substituteDate(
        locale,
        result,
        replaceKey,
        argKey,
        argValue,
        translationParams
      );
    }
    default: {
      return result.replace(replaceKey, String(argValue));
    }
  }
};
