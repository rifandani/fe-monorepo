# Unit tests

How to write and debug a `*.unit.test.ts`. The style comes from the `javascript-testing-expert` skill; the decisions behind this repo's setup are in [ADR-0009](../adr/0009-property-tests-use-fast-check.md).

## Imports

```ts
import { fc, test } from "@fast-check/vitest"; // test.prop, and test(..., ({ g }) => …)
import { describe, expect, it } from "vitest"; // every example test
```

- Example tests use `it` from `vitest`. The `it` of `@fast-check/vitest` reruns each test `numRuns` times when a global budget is set (`FC_NUM_RUNS`, Stryker), so a plain test runs 10–1000 times and a test with a mock fails.
- Effect files keep `it` from `@effect/vitest` (`it.effect`, `it.live`). A property there is `test.prop(...)` that runs the program with `Effect.runPromise`.
- `@test/arbitraries` holds the shared arbitraries (`sessionArb`, `signedInSessionArb`) and `ioPropertyParameters()`.

## File layout

1. Imports, then `// Helpers` (lint's `no-use-before-define` puts helpers above the `describe`s).
2. One `describe` per function, named after it.
3. Example Tests first: `it("should …")`, realistic data (Ada Lovelace), visible `// Arrange` / `// Act` / `// Assert`.
4. Property Tests after them: `test.prop([...])("should always …" | "should never …")`.

## Writing a property

- Build the input whose outcome you know (`a + b + c` contains `b`); assert a characteristic, not the whole value.
- Use arbitrary defaults. Add a constraint only when the code requires it, and say why in a comment.
- Prefer `map` and arbitrary options over `filter` / `fc.pre`.
- Through MSW: pass `ioPropertyParameters()` as the second argument of `test.prop` (20 runs, and a global budget still wins).
- Unstable values (today, random): `test("should …", ({ g }) => { vi.setSystemTime(g(fc.date, { noInvalidDate: true })); … })`.

## A property found a bug

- Shrink output is the minimal counterexample. Confirm it by hand before you call it a bug.
- Arbitrary too wide (the input is not legal for the code): narrow the arbitrary and comment the reason.
- Real bug, and the fix is not your task: record it with `it.fails("should … (known bug)")` on the minimal example, and keep the property on the inputs that work. When someone fixes the bug, the `it.fails` goes red; turn it into a normal `it`.

## Debug and fuzz

- A failed property ends with a **Replay Line**: `FC_SEED=<seed> bunx vitest run <file> -t "<name>"`. Run it as it is; the seed replays the same inputs and shrink.
- `bun run test:unit:fuzz` runs every property 1000 times (with a long timeout). Use it after you change a module that has properties.
- `it.prop` names end with `(with seed=…)`, which changes on each run. Filter with `-t` on the stable prefix.
