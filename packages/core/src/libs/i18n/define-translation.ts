type ParseOptionType<
  ParamType extends string,
  ParamName extends string,
> = ParamType extends "number"
  ? {
      number?: Partial<Record<ParamName, Intl.NumberFormatOptions>>;
    }
  : ParamType extends "plural"
    ? {
        plural: Record<
          ParamName,
          Partial<Record<Exclude<Intl.LDMLPluralRule, "other">, string>> & {
            other: string;
            formatter?: Intl.NumberFormatOptions;
            type?: Intl.PluralRuleType;
          }
        >;
      }
    : ParamType extends "date"
      ? {
          date?: Partial<Record<ParamName, Intl.DateTimeFormatOptions>>;
        }
      : ParamType extends "list"
        ? {
            list?: Partial<Record<ParamName, Intl.ListFormatOptions>>;
          }
        : ParamType extends "enum"
          ? {
              enum: Record<ParamName, Record<string, string>>;
            }
          : never;
type ExtractParamOptions<S extends string> =
  S extends `${string}{${infer Param}}${infer Rest}`
    ? Param extends `${infer Name}:${infer Type}`
      ? ParseOptionType<Type, Name> & ExtractParamOptions<Rest>
      : ExtractParamOptions<Rest>
    : unknown;
// "Hello "
// "name" = Param
// "! Your last login was {lastLoginDate:date}." = Rest
// "Hello {name}! Your last login was {lastLoginDate:date}."
export interface ParamOptions {
  date?: Record<string, Intl.DateTimeFormatOptions>;
  number?: Record<string, Intl.NumberFormatOptions>;
  plural?: Record<
    string,
    Partial<Record<Exclude<Intl.LDMLPluralRule, "other">, string>> & {
      other: string;
      formatter?: Intl.NumberFormatOptions;
      type?: Intl.PluralRuleType;
    }
  >;
  enum?: Record<string, Record<string, string>>;
  list?: Record<string, Intl.ListFormatOptions>;
}
export const defineTranslation = <
  S extends string,
  O extends ExtractParamOptions<S>,
>(
  string: S,
  options: O
): [S, O] => [string, options];
