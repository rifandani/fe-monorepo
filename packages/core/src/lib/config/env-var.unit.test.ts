import { describe, expect, it } from "@effect/vitest";
import { allEnvVars, makeEnvVar } from "@workspace/core/config/env-var";
import type { EnvValues } from "@workspace/core/config/env-var";
import { urlStringSchema } from "@workspace/core/http/schemas";
import { ConfigProvider, Effect, Result, Schema } from "effect";

const NAME = "VITE_API_BASE_URL";
const FIX = "set it in apps/spa/.env.local";

const urlConfig = (values: EnvValues) =>
  makeEnvVar({ values, fix: () => FIX })(urlStringSchema, NAME);

const readUrl = (values: EnvValues) =>
  urlConfig(values).parse(ConfigProvider.fromUnknown(values));

const urlFailureMessage = (values: EnvValues) =>
  Effect.flip(readUrl(values)).pipe(Effect.map((error) => error.message));

const readAll = (values: EnvValues) => {
  const envVar = makeEnvVar({ values, fix: () => FIX });

  return allEnvVars({
    apiBaseUrl: envVar(urlStringSchema, "VITE_API_BASE_URL"),
    appUrl: envVar(urlStringSchema, "VITE_APP_URL"),
  }).parse(ConfigProvider.fromUnknown(values));
};

describe("makeEnvVar", () => {
  it.effect("should give the value when it is valid", () =>
    Effect.gen(function* () {
      const values = { [NAME]: "https://api.example.com" };

      const value = yield* readUrl(values);

      expect(value).toBe("https://api.example.com");
    })
  );

  it.effect(
    "should give the variable, the rejected value, the reason and the fix",
    () =>
      Effect.gen(function* () {
        const values = { [NAME]: "not-a-url" };

        const message = yield* urlFailureMessage(values);

        expect(message).toBe(
          `SourceError: Env variable ${NAME} is "not-a-url". Expected an absolute URL. Fix: ${FIX}.`
        );
      })
  );

  it.effect("should say that a variable is not set", () =>
    Effect.gen(function* () {
      const values = {};

      const message = yield* urlFailureMessage(values);

      expect(message).toBe(
        `SourceError: Env variable ${NAME} is not set. The app reads it at startup. Fix: ${FIX}.`
      );
    })
  );

  it.effect("should say that a variable is empty", () =>
    Effect.gen(function* () {
      const values = { [NAME]: "" };

      const message = yield* urlFailureMessage(values);

      expect(message).toBe(
        `SourceError: Env variable ${NAME} is empty. The app reads it at startup. Fix: ${FIX}.`
      );
    })
  );

  it.effect(
    "should give the allowed literals for a value that is not one of them",
    () =>
      Effect.gen(function* () {
        const values = { VITE_OTEL_LOG_LEVEL: "LOUD" };

        const config = makeEnvVar({ values, fix: () => FIX })(
          Schema.Literals(["ERROR", "NONE"]),
          "VITE_OTEL_LOG_LEVEL"
        );

        const error = yield* Effect.flip(
          config.parse(ConfigProvider.fromUnknown(values))
        );

        expect(error.message).toBe(
          `SourceError: Env variable VITE_OTEL_LOG_LEVEL is "LOUD". Expected "ERROR" | "NONE". Fix: ${FIX}.`
        );
      })
  );

  it.effect.prop(
    "should always quote any rejected value and end with the fix",
    [Schema.String],
    ([suffix]) =>
      Effect.gen(function* () {
        const rejected = `not a url ${suffix}`;
        const values = { [NAME]: rejected };

        const message = yield* urlFailureMessage(values);

        expect(message).toContain(
          `SourceError: Env variable ${NAME} is ${JSON.stringify(rejected)}. `
        );
        expect(message.endsWith(`Fix: ${FIX}.`)).toBe(true);
      })
  );
});

describe("allEnvVars", () => {
  it.effect("should give every value when all variables are valid", () =>
    Effect.gen(function* () {
      const values = {
        VITE_API_BASE_URL: "https://api.example.com",
        VITE_APP_URL: "https://app.example.com",
      };

      const env = yield* readAll(values);

      expect(env).toEqual({
        apiBaseUrl: "https://api.example.com",
        appUrl: "https://app.example.com",
      });
    })
  );

  it.effect("should report every bad variable in one error", () =>
    Effect.gen(function* () {
      const values = { VITE_APP_URL: "not-a-url" };

      const error = yield* Effect.flip(readAll(values));

      expect(error.message).toBe(
        [
          "SourceError: 2 env variables are not valid.",
          `Env variable VITE_API_BASE_URL is not set. The app reads it at startup. Fix: ${FIX}.`,
          `Env variable VITE_APP_URL is "not-a-url". Expected an absolute URL. Fix: ${FIX}.`,
        ].join("\n")
      );
    })
  );

  it.effect("should count one bad variable in the singular", () =>
    Effect.gen(function* () {
      const values = {
        VITE_API_BASE_URL: "https://api.example.com",
        VITE_APP_URL: "",
      };

      const error = yield* Effect.flip(readAll(values));

      expect(error.message).toBe(
        [
          "SourceError: 1 env variable is not valid.",
          `Env variable VITE_APP_URL is empty. The app reads it at startup. Fix: ${FIX}.`,
        ].join("\n")
      );
    })
  );

  it.effect.prop(
    "should always name exactly the variables that are not valid",
    [Schema.Boolean, Schema.Boolean],
    ([apiIsBad, appIsBad]) =>
      Effect.gen(function* () {
        const values = {
          VITE_API_BASE_URL: apiIsBad ? "" : "https://api.example.com",
          VITE_APP_URL: appIsBad ? "bad" : "https://app.example.com",
        };

        const result = yield* Effect.result(readAll(values));

        const message = Result.isFailure(result) ? result.failure.message : "";

        expect(message.includes("VITE_API_BASE_URL")).toBe(apiIsBad);
        expect(message.includes("VITE_APP_URL")).toBe(appIsBad);
      })
  );
});
