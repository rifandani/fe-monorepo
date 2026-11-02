#!/usr/bin/env node
/**
 * Updates the vendored repositories under `repos/` to the tip of their
 * upstream branch, as `git subtree --squash` copies.
 *
 * Usage: bun scripts/update-vendored-repos.ts [name...]   (or bun repos:update)
 *   name   one or more keys of REPOS (default: all of them)
 *
 * Each repository gets one squash commit and one merge commit. A directory
 * that is plain files and not yet a subtree is first removed in its own
 * commit, because `git subtree add` refuses a prefix that exists.
 *
 * The upstream commit is resolved with `git ls-remote` and fetched by hash.
 * Never read it from FETCH_HEAD: when a fetch fails, FETCH_HEAD still holds
 * whatever was fetched last, and `git subtree` would vendor that instead.
 */
import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

interface VendoredRepo {
  url: string;
  branch: string;
}

const REPOS = {
  effect: { url: "https://github.com/Effect-TS/effect.git", branch: "main" },
} satisfies Record<string, VendoredRepo>;

type RepoName = keyof typeof REPOS;

const REPO_ROOT = path.resolve(import.meta.dirname, "..");

// The type annotation sits on the const and not on the arrow: that is what
// makes TypeScript narrow after a call to it.
const fail: (message: string) => never = (message) => {
  console.error(`repos:update: ${message}`);
  process.exit(1);
};

/** Runs git and returns trimmed stdout, or null on a non-zero exit. */
const tryGit = (args: string[]): string | null => {
  const result = spawnSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    maxBuffer: 64 * 1024 * 1024,
  });

  return result.status === 0 ? result.stdout.trim() : null;
};

const git = (args: string[]): string =>
  tryGit(args) ?? fail(`git ${args.join(" ")} failed`);

/** Runs git with its output shown, for the slow or noisy steps. */
const gitLoud = (args: string[]): void => {
  const result = spawnSync("git", args, { cwd: REPO_ROOT, stdio: "inherit" });

  if (result.status !== 0) {
    fail(`git ${args.join(" ")} failed (exit ${result.status ?? "signal"})`);
  }
};

const assertCleanTree = (): void => {
  if (git(["status", "--porcelain"]) !== "") {
    fail("the working tree is not clean. Commit or stash your changes first.");
  }
};

const resolveUpstream = ({ url, branch }: VendoredRepo): string => {
  const line = git(["ls-remote", url, `refs/heads/${branch}`]);
  const hash = line.split(/\s+/u)[0] ?? "";

  if (!/^[0-9a-f]{40}$/u.test(hash)) {
    fail(`cannot resolve ${branch} on ${url}`);
  }

  return hash;
};

const isTracked = (prefix: string): boolean =>
  git(["ls-files", "--", prefix]) !== "";

/**
 * The upstream commit the last squash vendored, or null if the prefix is not
 * a subtree on this branch. A squash-merged pull request drops the subtree
 * commits, so a plain copy can follow a subtree in history.
 */
const currentSplit = (prefix: string): string | null => {
  if (!isTracked(prefix)) {
    return null;
  }

  const body = tryGit([
    "log",
    "-1",
    "--extended-regexp",
    `--grep=^git-subtree-dir: ${prefix}/*$`,
    "--format=%B",
    "HEAD",
  ]);

  return (
    body?.match(/^git-subtree-split: (?<hash>[0-9a-f]{40})$/mu)?.groups?.hash ??
    null
  );
};

const fetchCommit = (repo: VendoredRepo, target: string): void => {
  gitLoud(["fetch", "--no-tags", repo.url, target]);

  if (tryGit(["cat-file", "-e", `${target}^{commit}`]) === null) {
    fail(`${target} is not in the object store after the fetch`);
  }
};

/** Clears the prefix for `git subtree add`, if it is not a subtree yet. */
const removePlainCopy = (prefix: string): void => {
  if (isTracked(prefix)) {
    console.log(`${prefix}: not a subtree yet, removing the plain copy`);
    git(["rm", "-r", "-q", "--", prefix]);
    git([
      "commit",
      "--no-verify",
      "-q",
      "-m",
      `chore(repos): remove ${prefix} before re-adding it as a git subtree`,
    ]);
  }

  // Ignored files (an editor's .vscode/, for example) survive `git rm` and
  // make `git subtree add` refuse the prefix.
  rmSync(path.join(REPO_ROOT, prefix), { recursive: true, force: true });
};

const assertMatchesUpstream = (prefix: string, target: string): void => {
  const vendored = git(["rev-parse", `HEAD:${prefix}`]);

  if (vendored !== git(["rev-parse", `${target}^{tree}`])) {
    fail(
      `${prefix} does not match upstream ${target.slice(0, 10)}. ` +
        "Local edits to the vendored copy were probably merged in."
    );
  }
};

const updateRepo = (name: RepoName): void => {
  const repo = REPOS[name];
  const prefix = `repos/${name}`;
  assertCleanTree();

  const target = resolveUpstream(repo);
  const split = currentSplit(prefix);

  if (split === target) {
    console.log(`${prefix}: already at ${target.slice(0, 10)}`);

    return;
  }

  console.log(`${prefix}: fetching ${repo.branch} (${target.slice(0, 10)})`);
  fetchCommit(repo, target);

  if (split === null) {
    removePlainCopy(prefix);
  }

  const mode = split === null ? "add" : "merge";
  gitLoud(["subtree", mode, `--prefix=${prefix}`, target, "--squash"]);

  assertMatchesUpstream(prefix, target);
  console.log(`${prefix}: updated to ${target.slice(0, 10)}`);
};

const isRepoName = (value: string): value is RepoName =>
  Object.hasOwn(REPOS, value);

const args = process.argv.slice(2);
const unknown = args.filter((arg) => !isRepoName(arg));

if (unknown.length > 0) {
  fail(
    `unknown repository: ${unknown.join(", ")}. ` +
      `Known: ${Object.keys(REPOS).join(", ")}`
  );
}

const names =
  args.length > 0
    ? args.filter(isRepoName)
    : Object.keys(REPOS).filter(isRepoName);

for (const name of names) {
  updateRepo(name);
}
