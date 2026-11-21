import { fc } from "@fast-check/vitest";

import type { AuthLoginResponseSchema } from "./packages/core/src/lib/auth/schemas.ts";

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

export const errorStatusArb = (...excluded: number[]) => {
  // oxlint-disable-next-line unicorn/no-array-sort -- the root tsconfig `lib` has no `toSorted`.
  const skipped = [407, ...excluded].sort((a, b) => a - b);

  return fc.integer({ min: 400, max: 599 - skipped.length }).map((value) => {
    let status = value;

    for (const skip of skipped) {
      if (status >= skip) {
        status += 1;
      }
    }

    return status;
  });
};

const IO_PROPERTY_RUNS = 20;

export const ioPropertyParameters = () => ({
  numRuns: fc.readConfigureGlobal().numRuns ?? IO_PROPERTY_RUNS,
});
