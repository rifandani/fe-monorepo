import { Config, ConfigProvider, SchemaIssue } from "effect";
import type { Schema } from "effect";

import { authorErrorMessage } from "../../utils/author-error.ts";

export type EnvValues = Readonly<Record<string, string | undefined>>;

export interface EnvSource {
  readonly values: EnvValues;
  readonly fix: (name: string) => string;
}

const formatIssue = SchemaIssue.makeFormatterDefault();

const isUnset = (value: string | undefined): value is "" | undefined =>
  value === undefined || value === "";

const describeValue = (value: string | undefined): string => {
  if (value === undefined) {
    return "is not set";
  }

  if (value === "") {
    return "is empty";
  }

  return `is ${JSON.stringify(value)}`;
};

const describeRejection = (rejection: Config.ConfigError): string => {
  const { cause } = rejection;

  if (cause instanceof ConfigProvider.SourceError) {
    return cause.message;
  }

  const { issue } = cause;

  return formatIssue(
    issue instanceof SchemaIssue.Pointer ? issue.issue : issue
  );
};

export const envVarMessage = (
  source: EnvSource,
  name: string,
  rejection: Config.ConfigError
): string => {
  const value = source.values[name];

  return authorErrorMessage(
    `Env variable ${name} ${describeValue(value)}`,
    isUnset(value)
      ? "The app reads it at startup"
      : describeRejection(rejection),
    source.fix(name)
  );
};

export const makeEnvVar =
  (source: EnvSource) =>
  <A>(schema: Schema.ConstraintCodec<A, unknown>, name: string) =>
    Config.schema(schema, name).pipe(
      Config.orElse((rejection) =>
        Config.fail(
          new ConfigProvider.SourceError({
            message: envVarMessage(source, name, rejection),
            cause: rejection,
          })
        )
      )
    );

type EnvVars = Readonly<Record<string, Config.Config<unknown>>>;

const rejectionOf = (config: Config.Config<unknown>) =>
  config.pipe(
    Config.map((): Config.ConfigError | undefined => undefined),
    Config.orElse((rejection) => Config.succeed(rejection))
  );

const describeRejections = (
  rejections: readonly Config.ConfigError[]
): string =>
  [
    rejections.length === 1
      ? "1 env variable is not valid."
      : `${rejections.length} env variables are not valid.`,
    ...rejections.map(({ cause }) => cause.message),
  ].join("\n");

export const allEnvVars = <const Vars extends EnvVars>(vars: Vars) =>
  Config.all(Object.values(vars).map(rejectionOf)).pipe(
    Config.flatMap((results) => {
      const rejections = results.filter((result) => result !== undefined);

      return rejections.length === 0
        ? Config.all(vars)
        : Config.fail(
            new ConfigProvider.SourceError({
              message: describeRejections(rejections),
              cause: rejections,
            })
          );
    })
  );
