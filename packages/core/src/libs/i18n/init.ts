/* oxlint-disable react-doctor/js-hoist-intl sonarjs/no-duplicate-string eslint/func-style */
import type {
  defineTranslation,
  ParamOptions,
} from "@workspace/core/libs/i18n/define-translation";
import type { Register } from "@workspace/core/libs/i18n/my-translations.d";

export type LocaleDictLanguage = "en-us" | "id-id";
type RegisteredTranslations = Register extends {
  translations: infer T;
}
  ? T extends infer Translations
    ? Translations
    : never
  : LanguageMessages;
type I18nMessage = string | ReturnType<typeof defineTranslation>;
export interface LanguageMessages {
  [key: string]: I18nMessage | LanguageMessages;
}
type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;
type DotPathsFor<T extends object = RegisteredTranslations> = {
  [K in keyof T]: T[K] extends I18nMessage
    ? K
    : T[K] extends object
      ? Join<K, DotPathsFor<T[K]>>
      : never;
}[keyof T];
type EnumMap = Record<string, Record<string, string>>;
type ParseArgType<
  ParamType extends string,
  ParamName extends string,
  Enums extends EnumMap,
> = ParamType extends "number" | "plural"
  ? number
  : ParamType extends "date"
    ? Date
    : ParamType extends "list"
      ? string[]
      : ParamType extends "enum"
        ? ParamName extends keyof Enums
          ? keyof Enums[ParamName]
          : never
        : never;
type ExtractParamArgs<
  S extends string,
  Enums extends EnumMap,
> = S extends `${string}{${infer Param}}${infer Rest}`
  ? Param extends `${infer Name}:${infer Type}`
    ? Record<Name, ParseArgType<Type, Name, Enums>> &
        ExtractParamArgs<Rest, Enums> // If the string contains a parameter with a type
    : Record<Param, string> & ExtractParamArgs<Rest, Enums> // If the string has no parameter type
  : unknown; // If the string has no parameters
type TranslationAtKeyWithParams<
  Translations,
  Key extends string,
> = Key extends `${infer First}.${infer Rest}`
  ? First extends keyof Translations
    ? TranslationAtKeyWithParams<Translations[First], Rest>
    : never
  : Key extends keyof Translations
    ? Translations[Key]
    : never;
type NormalizedTranslationAtKey<T> =
  T extends ReturnType<typeof defineTranslation>
    ? T
    : [T, ReturnType<typeof defineTranslation>[1]];
type NormalizedTranslationAtKeyWithParams<Key extends string> =
  NormalizedTranslationAtKey<
    TranslationAtKeyWithParams<RegisteredTranslations, Key>
  >;
type Params<S extends DotPathsFor> = ExtractParamArgs<
  NormalizedTranslationAtKeyWithParams<S>[0],
  NormalizedTranslationAtKeyWithParams<S>[1] extends {
    enum: infer E;
  }
    ? keyof E extends never
      ? EnumMap
      : E
    : EnumMap
>;
type PathsWithParams = {
  [K in DotPathsFor]: keyof Params<K> extends never ? never : K;
}[DotPathsFor];
type PathsWithNoParams = {
  [K in DotPathsFor]: keyof Params<K> extends never ? K : never;
}[DotPathsFor];
const replaceKeyRegex = /-?[^-]+$/u;

const getOrderedLocaleAndParentLocales = (locale: string) => {
  const locales = [];
  let parentLocale = locale;
  while (parentLocale !== "") {
    locales.push(parentLocale);
    parentLocale = parentLocale.replace(replaceKeyRegex, "");
  }
  return locales;
};

const getTranslationByKey = (obj: LanguageMessages, key: string) => {
  const keys = key.split(".");
  let currentObj = obj;
  for (let i = 0; i <= keys.length - 1; i += 1) {
    const k = keys[i];
    if (!k) {
      throw new Error("[getTranslationByKey]: Invalid key!");
    }
    const newObj = currentObj[k];
    if (!newObj) {
      return;
    }
    if (typeof newObj === "string" || Array.isArray(newObj)) {
      if (i < keys.length - 1) {
        return;
      }
      return newObj;
    }
    currentObj = newObj;
  }
};

const substitutePlural = (
  locale: string,
  result: string,
  argKey: string,
  argValue: unknown,
  replaceKey: string,
  translationParams: ParamOptions
): string => {
  if (typeof argValue !== "number") {
    throw new TypeError("Invalid argument");
  }
  const pluralMap = translationParams.plural?.[argKey];
  const pluralRules = new Intl.PluralRules(locale, {
    type: pluralMap?.type,
  });
  const replacement =
    pluralMap?.[pluralRules.select(argValue)] ?? pluralMap?.other;
  if (!replacement) {
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
  argKey: string,
  argValue: unknown,
  replaceKey: string,
  translationParams: ParamOptions
): string => {
  if (typeof argValue !== "string") {
    throw new TypeError("Invalid argument");
  }
  const enumMap = translationParams.enum?.[argKey];
  const replacement = enumMap?.[argValue];
  if (!replacement) {
    throw new Error("Missing replacement value");
  }
  return result.replace(replaceKey, replacement);
};

type Formatable = number | string[] | Date;

const substituteWithFormatter = <T extends Formatable>(
  result: string,
  replaceKey: string,
  argValue: unknown,
  isValid: (value: unknown) => value is T,
  format: (value: T) => string
): string => {
  if (!isValid(argValue)) {
    throw new TypeError("Invalid argument");
  }
  return result.replace(replaceKey, format(argValue));
};

const substituteNumber = (
  locale: string,
  result: string,
  argKey: string,
  argValue: unknown,
  replaceKey: string,
  translationParams: ParamOptions
): string =>
  substituteWithFormatter(
    result,
    replaceKey,
    argValue,
    (value): value is number => typeof value === "number",
    (value) =>
      new Intl.NumberFormat(locale, translationParams.number?.[argKey]).format(
        value
      )
  );

const substituteList = (
  locale: string,
  result: string,
  argKey: string,
  argValue: unknown,
  replaceKey: string,
  translationParams: ParamOptions
): string =>
  substituteWithFormatter(
    result,
    replaceKey,
    argValue,
    (value): value is string[] => Array.isArray(value),
    (value) =>
      new Intl.ListFormat(locale, translationParams.list?.[argKey]).format(
        value
      )
  );

const substituteDate = (
  locale: string,
  result: string,
  argKey: string,
  argValue: unknown,
  replaceKey: string,
  translationParams: ParamOptions
): string =>
  substituteWithFormatter(
    result,
    replaceKey,
    argValue,
    (value): value is Date => value instanceof Date,
    (value) =>
      new Intl.DateTimeFormat(locale, translationParams.date?.[argKey]).format(
        value
      )
  );

interface SubstitutionContext {
  locale: string;
  result: string;
  argKey: string;
  argValue: unknown;
  replaceKey: string;
  translationParams: ParamOptions;
}

/** Maps the `{arg:type}` annotation to the substituter handling it. */
const substituters: Record<string, (ctx: SubstitutionContext) => string> = {
  date: (c) =>
    substituteDate(
      c.locale,
      c.result,
      c.argKey,
      c.argValue,
      c.replaceKey,
      c.translationParams
    ),
  enum: (c) =>
    substituteEnum(
      c.result,
      c.argKey,
      c.argValue,
      c.replaceKey,
      c.translationParams
    ),
  list: (c) =>
    substituteList(
      c.locale,
      c.result,
      c.argKey,
      c.argValue,
      c.replaceKey,
      c.translationParams
    ),
  number: (c) =>
    substituteNumber(
      c.locale,
      c.result,
      c.argKey,
      c.argValue,
      c.replaceKey,
      c.translationParams
    ),
  plural: (c) =>
    substitutePlural(
      c.locale,
      c.result,
      c.argKey,
      c.argValue,
      c.replaceKey,
      c.translationParams
    ),
};

const performSubstitution = (
  locale: string,
  str: string,
  args: Record<string, unknown>,
  translationParams: ParamOptions
): string =>
  Object.entries(args).reduce((result, [argKey, argValue]) => {
    const match = result.match(`{${argKey}:?([^}]*)?}`);
    const [replaceKey, argType] = match || [`{${argKey}}`, undefined];
    const substitute = argType ? substituters[argType] : undefined;
    if (!substitute) {
      return result.replace(replaceKey, String(argValue));
    }
    return substitute({
      argKey,
      argValue,
      locale,
      replaceKey,
      result,
      translationParams,
    });
  }, str);

const getTranslation = <S extends DotPathsFor, A extends Params<S>>(
  locale: string,
  translations: LanguageMessages,
  key: S,
  args?: A
) => {
  const translation = getTranslationByKey(translations, key);
  const argObj = args || {};

  if (typeof translation === "string") {
    return performSubstitution(locale, translation, argObj, {});
  }
  if (Array.isArray(translation)) {
    const [str, translationParams] = translation;
    return performSubstitution(
      locale,
      str,
      argObj,
      translationParams as ParamOptions
    );
  }
};

export const initI18n = ({
  locale,
  fallbackLocale,
  translations,
}: {
  locale: string;
  fallbackLocale: string | string[];
  translations: Record<Lowercase<string>, LanguageMessages>;
}) => {
  const fallbackLocales = Array.isArray(fallbackLocale)
    ? fallbackLocale
    : [fallbackLocale];
  const orderedLocales = new Set([
    ...getOrderedLocaleAndParentLocales(locale),
    ...fallbackLocales.flatMap(getOrderedLocaleAndParentLocales),
  ]);
  function t<S extends PathsWithNoParams>(key: S): string;
  function t<S extends PathsWithParams, A extends Params<S>>(
    key: S,
    args: A
  ): string;
  function t<S extends DotPathsFor, A extends Params<S>>(key: S, args?: A) {
    for (const _locale of orderedLocales) {
      const translationFile =
        translations[_locale.toLowerCase() as Lowercase<string>];
      if (!translationFile) {
        continue;
      }
      const translation = getTranslation(_locale, translationFile, key, args);
      if (translation) {
        return translation;
      }
    }
    return key;
  }
  return {
    t,
  };
};
