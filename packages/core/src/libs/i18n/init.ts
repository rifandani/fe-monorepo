import type {
  defineTranslation,
  ParamOptions,
} from "@workspace/core/libs/i18n/define-translation";
import type { Register } from "@workspace/core/libs/i18n/my-translations.d";
import { substituteArg } from "@workspace/core/libs/i18n/substitute-arg";

export type LocaleDictLanguage = "en-us" | "id-id";
export type RegisteredTranslations = Register extends {
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
        ExtractParamArgs<Rest, Enums>
    : Record<Param, string> & ExtractParamArgs<Rest, Enums>
  : unknown;
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
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error i don't know
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
    if (newObj === null || newObj === undefined) {
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

const performSubstitution = (
  locale: string,
  str: string,
  args: Record<string, unknown>,
  translationParams: ParamOptions
): string => {
  let result = str;
  for (const [argKey, argValue] of Object.entries(args)) {
    result = substituteArg(locale, result, argKey, argValue, translationParams);
  }
  return result;
};

const getTranslation = <S extends DotPathsFor, A extends Params<S>>(
  locale: string,
  translations: LanguageMessages,
  key: S,
  args?: A
) => {
  const translation = getTranslationByKey(translations, key);
  const argObj = args || {};
  try {
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
  } catch {
    // Ignore substitution errors.
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
    for (const currentLocale of orderedLocales) {
      const translationFile =
        translations[currentLocale.toLowerCase() as Lowercase<string>];
      if (translationFile === null || translationFile === undefined) {
        continue;
      }
      const translation = getTranslation(
        currentLocale,
        translationFile,
        key,
        args
      );
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
