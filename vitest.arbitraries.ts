import { fc } from "@fast-check/vitest";
import { Arbitrary, Schema } from "effect";

import type { AuthLoginResponseSchema } from "./packages/core/src/lib/auth/schemas.ts";
import { emailStringSchema } from "./packages/core/src/lib/http/schemas.ts";

export const sessionArb: fc.Arbitrary<AuthLoginResponseSchema> = fc.record({
  accessToken: fc.string(),
  email: fc.emailAddress(),
  firstName: fc.string(),
  gender: fc.constantFrom("male", "female"),
  id: fc.integer({ min: 1 }),
  image: fc.webUrl(),
  lastName: fc.string(),
  refreshToken: fc.string(),
  username: fc.string(),
});

export const signedInSessionArb: fc.Arbitrary<AuthLoginResponseSchema> = fc
  .tuple(sessionArb, fc.stringMatching(/^[!-~]+$/u))
  .map(([session, accessToken]) => ({ ...session, accessToken }));

const IO_PROPERTY_RUNS = 20;

export const ioPropertyParameters = () => ({
  numRuns: fc.readConfigureGlobal().numRuns ?? IO_PROPERTY_RUNS,
});

export const ioPropertyOptions = () => ({
  arbitrary: { runs: fc.readConfigureGlobal().numRuns ?? IO_PROPERTY_RUNS },
});

const anyText = Arbitrary.schema(Schema.String);

export const accessTokenArbitrary = Arbitrary.schema(
  Schema.String.check(Schema.isPattern(/^[!-~]+$/u))
);

export const sessionArbitrary: Arbitrary.Arbitrary<AuthLoginResponseSchema> =
  Arbitrary.all({
    accessToken: anyText,
    email: Arbitrary.schema(emailStringSchema),
    firstName: anyText,
    gender: Arbitrary.schema(Schema.Literals(["male", "female"])),
    id: Arbitrary.schema(Schema.Int.check(Schema.isGreaterThan(0))),
    image: Arbitrary.schema(Schema.Int.check(Schema.isGreaterThan(0))).pipe(
      Arbitrary.map((n) => `https://example.com/${n}.png`)
    ),
    lastName: anyText,
    refreshToken: anyText,
    username: anyText,
  });

export const signedInSessionArbitrary: Arbitrary.Arbitrary<AuthLoginResponseSchema> =
  Arbitrary.all({
    session: sessionArbitrary,
    accessToken: accessTokenArbitrary,
  }).pipe(
    Arbitrary.map(({ session, accessToken }) => ({ ...session, accessToken }))
  );

export const errorStatusArbitrary = (...excluded: number[]) =>
  Arbitrary.schema(
    Schema.Int.check(
      Schema.isBetween({ minimum: 400, maximum: 599 }),
      Schema.makeFilter(
        (status: number) => status !== 407 && !excluded.includes(status)
      )
    )
  );
