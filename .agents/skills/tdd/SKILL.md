---
name: tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle — consult them before and during the loop, not after.

When exploring the codebase, read `CONTEXT.md` (if it exists) so test names and interface vocabulary match the project's domain language, and respect ADRs in the area you're touching.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists — and survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and setup, [mocking.md](mocking.md) for mocking guidelines and mock lifecycle, and [assertions.md](assertions.md) for how to write the assertions themselves.

## Write the failure, not the pass

A test exists to fail. Its value is the message it gives on the day it fails, so choose the assertion that names its own cause. Four defaults follow from that, each detailed in [assertions.md](assertions.md):

- **Assert on promise state.** `await expect(fn()).resolves.toEqual(...)`, not `expect(await fn()).toEqual(...)`. The second form silently drops the expectation that the promise resolves.
- **Trust implicit assertions.** An equality check already proves shape and length; an action already proves the element is there. Delete guard assertions — every assertion must relate to the intention under test.
- **Invert "must not happen".** A plain negative assertion on async state passes before the unwanted thing can appear. Build the positive expectation as a promise, do not await it, then `await expect(promise).rejects.toThrow()`. Never `sleep`.
- **Do not assert on requests.** A request is an implementation detail. Mocks are setup, not expectations: fix the network as a given, assert the user-facing outcome, and validate the payload inside the handler if the contract matters.

## Seams — where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything — agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

Ask: "What's the public interface, and which seams should we test?"

When the shape of that interface is itself in question — how deep the module is, where the seam belongs, what the interface should expose — use the `/codebase-design` skill for the vocabulary. It is the shared source of the module, interface, depth, seam, adapter, leverage and locality terms, and it is a reference to consult, not a session to run.

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth — a known-good literal, a worked example, the spec.
- **Mechanism-coupled assertion** — asserts on the request, the call count, or the argument list instead of the outcome the caller sees. The tell: the test names an HTTP verb or a spy, not a behavior.
- **False-positive negative** — `expect(...).not.toBe...` on state that arrives asynchronously. It passes before the unwanted state has a chance to appear, so it never fails. Use an inverse assertion.
- **Leaked mock state** — a stub or call history that survives into the next test, so the suite passes in isolation and fails in order. Reset between tests; see the clear/reset/restore table in [mocking.md](mocking.md).
- **Horizontal slicing** — writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead — one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle.
