type ParseOptionType<
  ParamType extends string,
  ParamName extends string,
> = ParamType extends 'number'
  ? { number?: { [K in ParamName]?: Intl.NumberFormatOptions } }
  : ParamType extends 'plural'
    ? {
        plural: {
          [K in ParamName]: Partial<
            Record<Exclude<Intl.LDMLPluralRule, 'other'>, string>
          > & {
            other: string
            formatter?: Intl.NumberFormatOptions
            type?: Intl.PluralRuleType
          }
        }
      }
    : ParamType extends 'date'
      ? { date?: { [K in ParamName]?: Intl.DateTimeFormatOptions } }
      : ParamType extends 'list'
        ? { list?: { [K in ParamName]?: Intl.ListFormatOptions } }
        : ParamType extends 'enum'
          ? { enum: { [K in ParamName]: Record<string, string> } }
          : never

type ExtractParamOptions<S extends string>
  = S extends `${string}{${infer Param}}${infer Rest}`
    ? Param extends `${infer Name}:${infer Type}` // If the string contains a parameter
      ? ParseOptionType<Type, Name> & ExtractParamOptions<Rest> // If the string contains a parameter with a type
      : ExtractParamOptions<Rest> // If the string has no parameter type
    : unknown // If the string has no parameters

// "Hello "
// "name" = Param
// "! Your last login was {lastLoginDate:date}." = Rest
// "Hello {name}! Your last login was {lastLoginDate:date}."

export interface ParamOptions {
  date?: Record<string, Intl.DateTimeFormatOptions>
  number?: Record<string, Intl.NumberFormatOptions>
  plural?: Record<
    string,
    Partial<Record<Exclude<Intl.LDMLPluralRule, 'other'>, string>> & {
      other: string
      formatter?: Intl.NumberFormatOptions
      type?: Intl.PluralRuleType
    }
  >
  enum?: Record<string, Record<string, string>>
  list?: Record<string, Intl.ListFormatOptions>
}

export function defineTranslation<
  S extends string,
  O extends ExtractParamOptions<S>,
>(string: S, options: O): [S, O] {
  return [string, options]
}
