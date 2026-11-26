import { Arbitrary } from "effect";
import {
  configureGlobal,
  defaultReportMessage,
  installGlobalPlugin,
} from "fast-check";
import type { GlobalParameters, Plugin } from "fast-check";
import { expect } from "vitest";

const isStryker = process.env.STRYKER_MUTATOR_WORKER !== undefined;

const STRYKER_SEED = 20_261_120;

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

const readSetting = (name: string, strykerValue: number) =>
  readInteger(name) ?? (isStryker ? strykerValue : undefined);

const buildGlobalParameters = (): GlobalParameters => {
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

const toReplayLine = (seed: number) => {
  const { currentTestName, testPath } = expect.getState();
  const parts = [`FC_SEED=${String(seed)}`];

  parts.push("bunx vitest run");

  if (testPath !== undefined) {
    parts.push(testPath.replace(`${process.cwd()}/`, ""));
  }

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

const globalParameters = buildGlobalParameters();

configureGlobal(globalParameters);

Arbitrary.configureGlobal({
  check: { seed: globalParameters.seed, runs: globalParameters.numRuns },
});

installGlobalPlugin(replayLinePlugin);
