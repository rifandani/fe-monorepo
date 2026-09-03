// Mutation testing. Advisory only — it never fails a build. Rationale, the
// Candidate Survivor / Equivalent Mutant vocabulary, and the upstream bugs every
// setting below hedges against live in docs/adr/0003-mutation-testing-is-advisory.md.
//
// `.mjs` rather than `.json` on purpose: the mutation scope is *derived* from the
// coverage allowlist rather than copied. A copy would drift silently and in the
// flattering direction — a newly allowlisted, thinly tested file would raise the
// mutation score by not being mutated at all.
import vitestConfig from "./vitest.config.ts";

const { include, exclude } = vitestConfig.test.coverage ?? {};

// This file's whole purpose is tracking the shape of that allowlist. If it moves,
// say so — an unguarded destructure would fail later as an opaque TypeError, or
// worse, silently mutate nothing and report a flattering score.
if (!(Array.isArray(include) && Array.isArray(exclude))) {
  throw new Error(
    "stryker.config.mjs expects `test.coverage.include`/`exclude` arrays in vitest.config.ts. " +
      "See docs/adr/0003-mutation-testing-is-advisory.md — mutation scope is derived from that allowlist, not copied."
  );
}

// Editor validation comes from `$schema` below, not a JSDoc `import()` type — the
// latter would make `@stryker-mutator/api` an undeclared dependency of this file.
export default {
  $schema: "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",

  // ADR-0001 makes `coverage.include` the definition of business logic. This reuses
  // that definition rather than opening a second one.
  // Pure derivation, with no mutation-only subtractions. Three were drafted on the
  // assumption that "constants" and "config-shaped output" mean "literal churn"; all
  // three were wrong when measured, and the ADR records what each actually scored.
  // Add a subtraction only for a file you have read a report for.
  mutate: [...include, ...exclude.map((glob) => `!${glob}`)],

  // Deliberately empty, recorded here rather than omitted so the choice is visible at
  // the site a reader would check. Excluding a whole mutator class is an empirical
  // claim; making it before reading a report blinds the tool to its own best findings.
  mutator: { excludedMutations: [] },

  testRunner: "vitest",
  // Bun installs into an isolated `node_modules/.bun/` store and symlinks, which
  // defeats Stryker's default `@stryker-mutator/*` plugin glob — without this the
  // runner never loads and `vitest` below is reported as an unknown option.
  plugins: ["@stryker-mutator/vitest-runner"],

  // Points at the *root* config so all three projects (core, spa, expo) load.
  // That is deliberate, not incidental: `@workspace/core` is aliased by path into
  // spa and expo, so a mutant in packages/core is covered by all three
  // projects' tests. Per-project Stryker configs would hide those cross-context
  // kills — and the per-project configs use `defineProject`, so they carry none of
  // the root options (`pool`, `isolate`, `fileParallelism`) anyway.
  vitest: { configFile: "vitest.config.ts" },

  // Deliberately points at a file that does not exist, which makes Stryker's
  // `TSConfigPreprocessor` a no-op instead of a crash.
  //
  // On typescript@7 that preprocessor throws `ts.parseConfigFileTextToJson is not a
  // function` (stryker-js#6111) — and it runs on *every* project with a tsconfig,
  // not only when the typescript-checker is enabled, so declining the checker does
  // not avoid it. Its sole job is rewriting relative `extends`/`references` paths
  // that would escape the sandbox; every tsconfig here extends a *package*
  // specifier (`@workspace/typescript-config/*`, `expo/tsconfig.base`) and none use
  // `references`, so there is nothing for it to rewrite. Revert to the default
  // ("tsconfig.json") once #6111 closes, or if a relative `extends` ever appears.
  tsconfigFile: "",

  // --- Determinism hedges. See ADR-0003; remove if stryker-js#6146 ships. ---
  //
  // The vitest runner forces `bail: 1` unless this is set. Under bail, a filtered
  // mutant run can finish with its tests collected but never executed; the runner
  // then reads zero results and reports the mutant **Survived** with `hitCount 0`.
  // stryker-js#6146 traces the verdict flips in #6073 to exactly that, and finds the
  // losses cluster after bail-aborted runs. Turning bail off runs every covering test
  // for every mutant — much slower, and the whole point of an advisory tool nobody
  // waits on.
  concurrency: 2,
  disableBail: true,

  // `coverageAnalysis` is deliberately absent: the vitest runner ignores it and
  // always uses "perTest". Setting it here would only imply a choice we don't have.

  // Purely report colouring — `break: null` means nothing here can fail a build.
  // Not tuned to flatter the first result, for the same reason ADR-0001 argues
  // against aspirational coverage targets.
  thresholds: { high: 80, low: 60, break: null },

  // Incremental mode caches verdicts, which under #6073 means freezing a phantom
  // survivor into the baseline until its file next changes — and making it look
  // stable. Off here; `bun test:mutate:inc` opts in for local iteration, where you
  // are reading the one file you're changing. Its baseline is also unstable on disk
  // (stryker-js#6004), so it goes to the gitignored output dir rather than being
  // committed — hence `incrementalFile` below, since Stryker would otherwise default
  // it to `reports/`, which nothing else in this repo uses.
  incremental: false,
  incrementalFile: "coverage/stryker/incremental.json",

  // Output lands in `coverage/stryker`, next to `coverage/vitest`. Both are test
  // *reports*, both are already gitignored by the bare `coverage` rule, and keeping
  // them siblings means one place to look. Note the root of `coverage/` still belongs
  // to fallow's runtime sidecar traces — see the comment in vitest.config.ts.
  //
  // `json` alongside `html` so a run is diffable: comparing two runs' verdicts is
  // how you tell a real Candidate Survivor from a #6073 phantom.
  reporters: ["html", "json", "clear-text", "progress"],
  htmlReporter: { fileName: "coverage/stryker/mutation.html" },
  jsonReporter: { fileName: "coverage/stryker/mutation.json" },

  // Stryker copies the project into `.stryker-tmp` before mutating. Two reasons to
  // prune: `.claude/skills` is a symlink to a directory, and `copyfile` fails on it
  // with ENOTSUP; and the default sweep picks up ~12k files, none of which below are
  // reachable from a Vitest run. Agent tooling, docs and reports are not test inputs.
  ignorePatterns: [
    ".claude",
    ".agents",
    ".cursor",
    ".fallow",
    ".husky",
    ".vscode",
    ".changeset",
    ".github",
    "docker",
    "coverage",
    "**/docs/**",
    "**/e2e/**",
    "**/playwright*/**",
    "**/.next/**",
    "**/.expo/**",
    "**/dev-dist/**",
    // Native and build output. Untracked, and `apps/expo/ios/Pods` in particular is
    // full of broken symlinks that fail the copy outright (ENOENT on copyfile).
    "**/ios/**",
    "**/android/**",
    "**/Pods/**",
    "**/.gradle/**",
    "**/dist/**",
    "**/build/**",
    "**/.tamagui/**",
    "**/.tanstack/**",
    "**/.evlog/**",
    "**/.vercel/**",
    "**/.repos/**",
  ],
};
