# Local DEV Feature Flags via TanStack Devtools

Spa gates developer-only surfaces (starting with the Component Catalog) behind local Feature Flags — not remote config. Flags default ON in development and OFF otherwise; overrides persist in the browser and are toggled from a custom TanStack Devtools panel. Production builds never mount Devtools and never honor an ON override, so gated routes stay unreachable outside DEV.

> On 2026-11-25 each flag got an owner and a removal date — see [Every flag has an owner and a removal date](#every-flag-has-an-owner-and-a-removal-date).

## Every flag has an owner and a removal date

A flag is temporary. Without an owner and an end date, old flags stay in the code. Thus each entry in `featureFlagRegistry` (`src/lib/feature-flags/registry.ts`) has two required fields:

- `owner`: the GitHub login of the person who removes the flag, without `@`.
- `removeBy`: the last day that the flag can stay in the code. Use an ISO date (`YYYY-MM-DD`). The test reads it as a UTC day.

The `FeatureFlagDefinition` type makes both fields required. A flag without them does not compile.

The unit test `registry.unit.test.ts` fails when the UTC date today is after the `removeBy` of a flag. The failure message names the flag, the date and the owner. When the test fails, the owner removes the flag. Or the owner moves `removeBy` to a later date and adds the reason to this ADR.

We do not use a lint rule for this. A lint rule that compares a date with "today" is not deterministic, because the same commit passes on one day and fails on the next.

The expiry test is the only unit test that reads the real clock. The testing guidance tells tests to control "today". This test does not, because its function is to fail on the day that a flag is due. The tests of `findExpiredFeatureFlags` itself use fixed dates and fast-check dates.
