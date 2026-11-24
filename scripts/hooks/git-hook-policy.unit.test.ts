import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

import { segmentsOf, skipsHooks } from "./git-hook-policy.ts";

const singleQuotable = () =>
  fc.string().map((value) => value.replaceAll("'", ""));

describe(skipsHooks, () => {
  it.each([
    "git status",
    "git commit -m 'feat: add a route'",
    'git commit -am "fix: keep the cause"',
    "git commit -m 'a -n flag in a message'",
    "git commit -m 'docs: explain .git/hooks'",
    "git commit -- -n",
    "git commit -m -n",
    "git commit -C HEAD",
    "git commit -a -m wip",
    "git commit --message -n",
    "git --no-pager log",
    "git -c",
    "env",
    "HUSKY=1",
    "bash script.sh",
    "bash -c",
    "git push origin main",
    "git config core.hooksPath",
    "git config --get core.hooksPath",
    "cat .git/hooks/pre-commit",
    "ls .husky/_",
    "echo HUSKY=0",
    "HUSKY=1 git commit -m wip",
    "bun lint:fix && git commit -m 'chore: lint'",
    "rtk git commit -m 'feat: x'",
    "bash -c 'git commit -m safe'",
  ])("should allow %j", (command) => {
    const result = skipsHooks(command);

    expect(result).toBeFalsy();
  });

  it.each([
    "git commit --no-verify -m wip",
    "git commit --no-veri -m wip",
    "git commit -n -m wip",
    "git commit -nm wip",
    "git commit -am wip -n",
    "git -C apps/hono commit -n -m wip",
    "git commit --author 'Ada Lovelace <ada@example.com>' -n",
    "git --no-pager commit -n -m wip",
    "git push --no-verify",
    "git merge --no-verify feature",
    "HUSKY=0 git commit -m wip",
    "env HUSKY=0 git commit -m wip",
    "export HUSKY=0; git commit -m wip",
    "git -c core.hooksPath=/dev/null commit -m wip",
    "git -ccore.hooksPath=/dev/null commit -m wip",
    "git --config-env=core.hooksPath=EMPTY commit -m wip",
    "git config core.hooksPath /dev/null",
    "git config --unset core.hooksPath",
    "git config --local core.hooksPath=.nope",
    "rm .git/hooks/pre-commit",
    "rm -rf .husky/_",
    "echo exit 0 > .git/hooks/pre-commit",
    "bun lint:fix && git commit --no-verify -m wip",
    "rtk proxy git commit --no-verify -m wip",
    "/usr/bin/git commit -n -m wip",
    "bash -c 'git commit --no-verify -m wip'",
    'zsh -lc "HUSKY=0 git commit -m wip"',
    "eval git commit -n -m wip",
    "git commit -m wip\ngit commit --amend --no-verify",
  ])("should block %j", (command) => {
    const result = skipsHooks(command);

    expect(result).toBeTruthy();
  });

  it("should never block a commit whose message is quoted text", () => {
    fc.assert(
      fc.property(singleQuotable(), (message) => {
        const result = skipsHooks(`git commit -m '${message}'`);

        expect(result).toBeFalsy();
      })
    );
  });

  it("should always block a commit with --no-verify, whatever the message", () => {
    fc.assert(
      fc.property(singleQuotable(), (message) => {
        const result = skipsHooks(`git commit -m '${message}' --no-verify`);

        expect(result).toBeTruthy();
      })
    );
  });
});

describe(segmentsOf, () => {
  it("should split a command at shell separators", () => {
    const result = segmentsOf("a 1; b 2 && c | d").map((segment) =>
      segment.map((token) => token.text)
    );

    expect(result).toStrictEqual([["a", "1"], ["b", "2"], ["c"], ["d"]]);
  });

  it("should join quoted and escaped pieces into one word", () => {
    const result = segmentsOf(`say "a \\"b\\"" 'c d'e\\ f`)[0]?.map(
      (token) => token.text
    );

    expect(result).toStrictEqual(["say", 'a "b"', "c de f"]);
  });

  it("should mark a quoted word as not an assignment", () => {
    const result = segmentsOf(`"HUSKY=0" X=1`)[0]?.map(
      (token) => token.assignable
    );

    expect(result).toStrictEqual([false, true]);
  });

  it("should keep a redirect as its own token", () => {
    const result = segmentsOf("echo x >> log")[0]?.map((token) => [
      token.text,
      token.redirect,
    ]);

    expect(result).toStrictEqual([
      ["echo", false],
      ["x", false],
      [">>", true],
      ["log", false],
    ]);
  });
});
