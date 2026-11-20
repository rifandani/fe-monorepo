/**
 * Global fast-check settings for the unit suite. Rationale: docs/adr/0009-property-tests-use-fast-check.md.
 *
 * Imported by `vitest.setup.ts`. It is evaluated once per module graph, so the
 * plugin below is installed once per test file (or once per worker when files
 * share a module graph), never twice in one graph.
 *
 * Env overrides (read once, when the worker starts):
 * - `FC_NUM_RUNS` — runs per Property Test, for example `FC_NUM_RUNS=10000` for deep local fuzzing.
 * - `FC_SEED` — replay one failure. Copy it from the Replay Line of the failure.
 *   The seed alone regenerates the same inputs, and shrinking then finds the
 *   same minimal counterexample. (fast-check has no global `path`, so the
 *   shrink path cannot be replayed from here.)
 */
import {
  configureGlobal,
  defaultReportMessage,
  installGlobalPlugin,
} from "fast-check";
import type { GlobalParameters, Plugin } from "fast-check";
import { expect } from "vitest";

/** Stryker sets this in each of its worker processes; Vitest threads inherit it. */
const isStryker = process.env.STRYKER_MUTATOR_WORKER !== undefined;

/**
 * Under Stryker, the seed is fixed for two reasons (ADR-0009):
 * - `@fast-check/vitest` puts the seed in the name of each `test.prop` test, and
 *   Stryker maps mutants to tests by name between the dry run and each mutant run.
 * - ADR-0003 needs stable verdicts; a random seed is one more source of flips.
 */
const STRYKER_SEED = 20_261_120;

/** Each mutant reruns every covering test (`disableBail`), so 100 runs per property costs too much. */
const STRYKER_NUM_RUNS = 10;

const readInteger = (name: string): number | undefined => {
  const value = process.env[name];

  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new TypeError(`${name} must be an integer, received "${value}"`);
  }

  return parsed;
};

/** The env var `name`, else `strykerValue` under Stryker, else `undefined`. */
const readSetting = (name: string, strykerValue: number) =>
  readInteger(name) ?? (isStryker ? strykerValue : undefined);

const buildGlobalParameters = (): GlobalParameters => {
  // `numRuns` stays unset unless overridden: the `g` one-time random mode of
  // `@fast-check/vitest` reads `numRuns ?? 1`, so a global 100 would run every
  // `g` test 100 times. `test.prop` falls back to the fast-check default (100).
  const settings = {
    seed: readSetting("FC_SEED", STRYKER_SEED),
    numRuns: readSetting("FC_NUM_RUNS", STRYKER_NUM_RUNS),
  };

  return Object.fromEntries(
    Object.entries(settings).filter(([, value]) => value !== undefined)
  );
};

const escapeRegExp = (text: string) =>
  text.replaceAll(/[.*+?^${}()|[\]\\]/gu, String.raw`\$&`);

/**
 * Builds the Replay Line: one shell command that reruns only the failing test
 * with the seed that produced the failure.
 */
const toReplayLine = (seed: number) => {
  const { currentTestName, testPath } = expect.getState();
  const parts = [`FC_SEED=${String(seed)}`];

  parts.push("bunx vitest run");

  if (testPath !== undefined) {
    parts.push(testPath.replace(`${process.cwd()}/`, ""));
  }

  // The leaf name holds `(with seed=…)`, which changes with the seed. Match the stable prefix only.
  const leafName = currentTestName
    ?.split(" > ")
    .at(-1)
    ?.replace(/ \(with seed=-?\d+\)$/u, "");

  if (leafName !== undefined) {
    parts.push(`-t "${escapeRegExp(leafName)}"`);
  }

  return parts.join(" ");
};

const replayLinePlugin: Plugin<unknown> = () => ({
  onAllRunsComplete: (runDetails) => {
    const report = defaultReportMessage(runDetails);

    if (report === undefined) {
      return;
    }

    throw new Error(
      `${report}\n\nReplay Line:\n${toReplayLine(runDetails.seed)}`,
      { cause: runDetails.errorInstance ?? undefined }
    );
  },
});

configureGlobal(buildGlobalParameters());

installGlobalPlugin(replayLinePlugin);
