import type { TOptions } from "i18next";
import i18n, { t as translateKey } from "i18next";

import type en from "./locales/en.json";
/**
 * Builds up valid keypaths for translations.
 */
export type TxKeyPath = RecursiveKeyOf<typeof en>;
// via: https://stackoverflow.com/a/65333050
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `${TKey}`,
    true
  >;
}[keyof TObj & (string | number)];
type RecursiveKeyOfInner<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: RecursiveKeyOfHandleValue<
    TObj[TKey],
    `${TKey}`,
    false
  >;
}[keyof TObj & (string | number)];
type RecursiveKeyOfHandleValue<
  TValue,
  Text extends string,
  IsFirstLevel extends boolean,
> = TValue extends unknown[]
  ? Text
  : TValue extends object
    ? IsFirstLevel extends true
      ? Text | `${Text}:${RecursiveKeyOfInner<TValue>}`
      : Text | `${Text}.${RecursiveKeyOfInner<TValue>}`
    : Text;
export const translate = (key: TxKeyPath, options?: TOptions): string => {
  if (i18n.isInitialized) {
    // @ts-expect-error unused anyway
    return translateKey(key, options);
  }
  return key;
};
