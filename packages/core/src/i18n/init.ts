/* oxlint-disable react-doctor/js-hoist-intl sonarjs/no-duplicate-string eslint/func-style */
import type { ParamOptions } from "@workspace/core/i18n/define-translation";
import type { Register } from "@workspace/core/i18n/my-translations";

type RegisteredTranslations = Register extends {
  translations: infer T;
}
  ? T extends infer Translations
    ? Translations
    : never
  : LanguageMessages;

type I18nMessageWithOptions = [string, ParamOptions];

type I18nMessage = string | I18nMessageWithOptions;

export interface LanguageMessages {
  [key: string]: I18nMessage | LanguageMessages;
}

type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

type IsWideCatalog<T> = string extends keyof T ? true : false;

type MaxCatalogDepth = 8;

type DotPathsFor<
  T,
  Depth extends unknown[] = [],
> = Depth["length"] extends MaxCatalogDepth
  ? never
  : IsWideCatalog<T> extends true
    ? string
    : {
        [K in Extract<keyof T, string>]: T[K] extends I18nMessage
          ? K
          : T[K] extends object
            ? Join<K, DotPathsFor<T[K], [...Depth, unknown]>>
            : never;
      }[Extract<keyof T, string>];

type EnumMap = Record<string, Record<string, string>>;

type TranslationArg = Date | number | string | string[];

type TranslationArgs = Record<string, TranslationArg>;

type NoParams = { readonly [Name in never]: TranslationArg };

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
  S,
  Enums extends EnumMap,
> = S extends `${string}{${infer Param}}${infer Rest}`
  ? Param extends `${infer Name}:${infer Type}`
    ? Record<Name, ParseArgType<Type, Name, Enums>> &
        ExtractParamArgs<Rest, Enums>
    : Record<Param, string> & ExtractParamArgs<Rest, Enums>
  : NoParams;

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

type NormalizedTranslationAtKey<T> = T extends I18nMessageWithOptions
  ? T
  : [T, ParamOptions];

type NormalizedTranslationAtKeyWithParams<
  Translations,
  Key extends string,
> = NormalizedTranslationAtKey<TranslationAtKeyWithParams<Translations, Key>>;

type Params<T extends LanguageMessages, S extends string> =
  IsWideCatalog<T> extends true
    ? TranslationArgs
    : ExtractParamArgs<
        NormalizedTranslationAtKeyWithParams<T, S>[0],
        NormalizedTranslationAtKeyWithParams<T, S>[1] extends {
          enum: infer E;
        }
          ? keyof E extends never
            ? EnumMap
            : E
          : EnumMap
      >;

type PathWithParams<T extends LanguageMessages, K> = K extends string
  ? keyof Params<T, K> extends never
    ? never
    : K
  : never;

type PathWithNoParams<T extends LanguageMessages, K> = K extends string
  ? keyof Params<T, K> extends never
    ? K
    : never
  : never;

type PathsWithParams<T extends LanguageMessages> =
  IsWideCatalog<T> extends true ? string : PathWithParams<T, DotPathsFor<T>>;

type PathsWithNoParams<T extends LanguageMessages> =
  IsWideCatalog<T> extends true ? string : PathWithNoParams<T, DotPathsFor<T>>;

const replaceKeyRegex = /-?[^-]+$/u;

const isRenderableMessage = (
  value: I18nMessage | LanguageMessages
): value is I18nMessage => typeof value === "string" || Array.isArray(value);

const isPlainMessage = (value: I18nMessage): value is string =>
  typeof value === "string";

const isNumberArg = (value: TranslationArg): value is number =>
  typeof value === "number";

const isStringArg = (value: TranslationArg): value is string =>
  typeof value === "string";

const replaceLiteral = (text: string, search: string, value: string) =>
  text.replace(search, () => value);

const REGEXP_SYNTAX = /[$()*+.?[\\\]^{|}]/gu;

const escapeRegExp = (text: string) => text.replaceAll(REGEXP_SYNTAX, "\\$&");

const getOrderedLocaleAndParentLocales = (locale: string) => {
  const locales = [];
  let parentLocale = locale;

  while (parentLocale !== "") {
    locales.push(parentLocale);
    parentLocale = parentLocale.replace(replaceKeyRegex, "");
  }

  return locales;
};

const getTranslationByKey = (
  obj: LanguageMessages,
  key: string
): I18nMessage | undefined => {
  let current: I18nMessage | LanguageMessages | undefined = obj;

  for (const k of key.split(".")) {
    if (k === "") {
      throw new Error("[getTranslationByKey]: Invalid key!");
    }

    if (current === undefined || isRenderableMessage(current)) {
      current = undefined;
      break;
    }

    current = current[k];
  }

  return current !== undefined && current !== "" && isRenderableMessage(current)
    ? current
    : undefined;
};

interface SubstitutionContext {
  locale: string;
  result: string;
  argKey: string;
  argValue: TranslationArg;
  replaceKey: string;
  translationParams: ParamOptions;
}

const getPluralReplacement = (
  locale: string,
  argKey: string,
  argValue: number,
  translationParams: ParamOptions
) => {
  const pluralMap = translationParams.plural?.[argKey];

  const pluralRules = new Intl.PluralRules(locale, {
    type: pluralMap?.type,
  });

  return {
    formatter: pluralMap?.formatter,
    replacement: pluralMap?.[pluralRules.select(argValue)] ?? pluralMap?.other,
  };
};

const substitutePlural = ({
  locale,
  result,
  argKey,
  argValue,
  replaceKey,
  translationParams,
}: SubstitutionContext): string => {
  if (!isNumberArg(argValue)) {
    throw new TypeError("Invalid argument");
  }

  const { formatter, replacement } = getPluralReplacement(
    locale,
    argKey,
    argValue,
    translationParams
  );

  if (replacement === undefined || replacement === "") {
    throw new Error("Missing replacement value");
  }

  const numberFormatter = new Intl.NumberFormat(locale, formatter);

  return replaceLiteral(
    result,
    replaceKey,
    replaceLiteral(replacement, "{?}", numberFormatter.format(argValue))
  );
};

const substituteEnum = ({
  result,
  argKey,
  argValue,
  replaceKey,
  translationParams,
}: SubstitutionContext): string => {
  if (!isStringArg(argValue)) {
    throw new TypeError("Invalid argument");
  }

  const replacement = translationParams.enum?.[argKey]?.[argValue];

  if (replacement === undefined || replacement === "") {
    throw new Error("Missing replacement value");
  }

  return replaceLiteral(result, replaceKey, replacement);
};

type Formatable = number | string[] | Date;

const substituteWithFormatter =
  <T extends Formatable>(
    isValid: (value: TranslationArg) => value is T,
    format: (ctx: SubstitutionContext, value: T) => string
  ) =>
  (ctx: SubstitutionContext): string => {
    if (!isValid(ctx.argValue)) {
      throw new TypeError("Invalid argument");
    }

    return replaceLiteral(
      ctx.result,
      ctx.replaceKey,
      format(ctx, ctx.argValue)
    );
  };

type Substituter = (ctx: SubstitutionContext) => string;

interface SubstituterMap {
  [annotation: string]: Substituter;
}

const substituters: SubstituterMap = {
  date: substituteWithFormatter(
    (value): value is Date => value instanceof Date,
    (c, value) =>
      new Intl.DateTimeFormat(
        c.locale,
        c.translationParams.date?.[c.argKey]
      ).format(value)
  ),
  enum: substituteEnum,
  list: substituteWithFormatter(
    (value): value is string[] => Array.isArray(value),
    (c, value) =>
      new Intl.ListFormat(
        c.locale,
        c.translationParams.list?.[c.argKey]
      ).format(value)
  ),
  number: substituteWithFormatter(
    (value): value is number => typeof value === "number",
    (c, value) =>
      new Intl.NumberFormat(
        c.locale,
        c.translationParams.number?.[c.argKey]
      ).format(value)
  ),
  plural: substitutePlural,
};

const performSubstitution = (
  locale: string,
  str: string,
  args: TranslationArgs,
  translationParams: ParamOptions
): string =>
  Object.entries(args).reduce((result, [argKey, argValue]) => {
    const match = new RegExp(
      `\\{${escapeRegExp(argKey)}:?([^}]*)?\\}`,
      "u"
    ).exec(result);

    const [replaceKey, argType] = match ?? [`{${argKey}}`, undefined];

    const substitute =
      argType === undefined || argType === ""
        ? undefined
        : substituters[argType];

    if (!substitute) {
      return replaceLiteral(result, replaceKey, String(argValue));
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

const getTranslation = (
  locale: string,
  translations: LanguageMessages,
  key: string,
  args?: TranslationArgs
): string | undefined => {
  const translation = getTranslationByKey(translations, key);
  const argObj = args ?? {};

  if (translation === undefined) {
    return translation;
  }

  if (isPlainMessage(translation)) {
    return performSubstitution(locale, translation, argObj, {});
  }

  const [str, translationParams] = translation;

  return performSubstitution(locale, str, argObj, translationParams);
};

export const initI18n = <T extends LanguageMessages = RegisteredTranslations>({
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

  const translationsByLocale = new Map(Object.entries(translations));

  function t(key: PathsWithNoParams<T>): string;
  function t<S extends PathsWithParams<T>>(key: S, args: Params<T, S>): string;
  function t(key: string, args?: TranslationArgs) {
    for (const _locale of orderedLocales) {
      const translationFile = translationsByLocale.get(_locale.toLowerCase());

      if (!translationFile) {
        continue;
      }

      const translation = getTranslation(_locale, translationFile, key, args);

      if (translation !== undefined && translation !== "") {
        return translation;
      }
    }

    return key;
  }

  return {
    t,
  };
};

export type I18n<T extends LanguageMessages = RegisteredTranslations> =
  ReturnType<typeof initI18n<T>>;
