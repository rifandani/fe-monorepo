/**
 * Shared fast-check arbitraries for domain values that more than one unit test
 * file builds. Imported as `@test/arbitraries`. Rationale: docs/adr/0009-property-tests-use-fast-check.md.
 *
 * Root-level test infrastructure, like `vitest.msw.ts`: it sits outside every
 * `src/`, so coverage and Stryker never measure it.
 */
import { fc } from "@fast-check/vitest";

// Relative: the root is not a workspace package, so `@workspace/core` does not resolve here.
import type { AuthLoginResponseSchema } from "./packages/core/src/lib/auth/schemas.ts";

/**
 * Any Session that `authLoginResponseSchema` accepts. Use it where a test does
 * not care about the person; use a realistic fixture where the test documents
 * one.
 */
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

/** A Session whose Access Token is usable: non-empty, and legal in a header. */
export const signedInSessionArb: fc.Arbitrary<AuthLoginResponseSchema> = fc
  .tuple(sessionArb, fc.stringMatching(/^[!-~]+$/u))
  .map(([session, accessToken]) => ({ ...session, accessToken }));

/**
 * An HTTP error status (400–599) not in `excluded`, built by shifting past each
 * excluded value instead of filtering.
 *
 * 407 is always excluded: `fetch` turns a 407 (Proxy Authentication Required)
 * into a network error, so it never reaches the client as a response.
 */
export const errorStatusArb = (...excluded: number[]) => {
  // A new array, so `sort` changes nothing of the caller.
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

/** Runs for a Property Test whose every run goes through MSW. */
const IO_PROPERTY_RUNS = 20;

/**
 * Parameters for a Property Test whose every run crosses the Network Boundary
 * (MSW): about 2–3 ms per run, so the default 100 runs costs a lot. A global
 * `numRuns` (`FC_NUM_RUNS`, or the Stryker budget) still wins, because a
 * per-test `numRuns` would otherwise override it.
 *
 * @example
 *
 * ```ts
 * test.prop([sessionArb], ioPropertyParameters())("should …", async (session) => {});
 * ```
 */
export const ioPropertyParameters = () => ({
  numRuns: fc.readConfigureGlobal().numRuns ?? IO_PROPERTY_RUNS,
});
