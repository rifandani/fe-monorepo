import { fc, test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import { hasReason, isDirective, isSuppression } from "./comment-directive.ts";

describe("isDirective", () => {
  it.each([
    " oxlint-disable-next-line typescript/no-explicit-any",
    " @ts-expect-error -- the global is deleted on purpose",
    " fallow-ignore-file unused-file",
    '/ <reference types="vite/client" />',
    "* @type {import('vite').UserConfig} ",
    " Stryker disable next-line all",
    " SAFETY: the parser checked every field before the cast",
    "* SAFETY: the registry key is a literal union ",
  ])("should keep the tool directive %j", (value) => {
    const comment = { type: "Line", value } as const;

    const result = isDirective(comment);

    expect(result).toBe(true);
  });

  it("should keep a shebang", () => {
    const comment = { type: "Shebang", value: "/usr/bin/env node" } as const;

    const result = isDirective(comment);

    expect(result).toBe(true);
  });

  it.each([
    " Arrange",
    "* Stryker copies the project into `.stryker-tmp` before mutating. ",
    " SAFETY:",
    " SAFETY note without a colon",
    " the cast is fine. SAFETY: checked above",
    "* @description The Session of this app ",
  ])("should treat the prose %j as a comment", (value) => {
    const comment = { type: "Block", value } as const;

    const result = isDirective(comment);

    expect(result).toBe(false);
  });
});

describe("isSuppression", () => {
  it.each([
    " oxlint-disable-next-line no-console",
    " eslint-disable no-console",
    " oxlint-disable-line no-console",
    " @ts-expect-error",
    " @ts-ignore",
    " @ts-nocheck",
    " fallow-ignore-next-line unused-export",
    " fallow-ignore-file unused-file",
    " Stryker disable next-line all",
    " istanbul ignore next",
    " v8 ignore next",
    " c8 ignore start",
    " gitleaks:allow",
    "*\n * @ts-expect-error\n ",
  ])("should treat %j as a suppression", (value) => {
    const comment = { type: "Line", value } as const;

    const result = isSuppression(comment);

    expect(result).toBeTruthy();
  });

  it.each([
    " oxlint-enable no-console",
    " eslint-enable",
    " @ts-check",
    " Stryker restore all",
    " v8 ignore stop",
    " c8 ignore stop",
    " #__PURE__",
    " @vitest-environment node",
    " SAFETY: the key was checked",
    " a note about @ts-ignore",
  ])("should not treat %j as a suppression", (value) => {
    const comment = { type: "Line", value } as const;

    const result = isSuppression(comment);

    expect(result).toBeFalsy();
  });

  it("should not treat a shebang as a suppression", () => {
    const comment = { type: "Shebang", value: " @ts-ignore" } as const;

    const result = isSuppression(comment);

    expect(result).toBeFalsy();
  });
});

describe("hasReason", () => {
  it.each([
    " @ts-expect-error -- the global is deleted on purpose",
    " fallow-ignore-next-line unused-export -- read by the CLI",
    " v8 ignore next -- @preserve",
    " Stryker disable next-line all: the log text is not behaviour",
    " Stryker disable next-line all -- the log text is not behaviour",
  ])("should find the reason in %j", (value) => {
    const comment = { type: "Line", value } as const;

    const result = hasReason(comment);

    expect(result).toBeTruthy();
  });

  it.each([
    " @ts-expect-error",
    " @ts-ignore --",
    " @ts-ignore - not a separator",
    " @ts-ignore --no-space",
    " Stryker disable next-line all:",
    " istanbul ignore next: a colon is only for Stryker",
  ])("should find no reason in %j", (value) => {
    const comment = { type: "Line", value } as const;

    const result = hasReason(comment);

    expect(result).toBeFalsy();
  });

  test.prop([
    fc.string(),
    fc.string({ minLength: 1 }).map((reason) => `x${reason}`),
  ])(
    "should always find a reason written after a spaced double dash",
    (directive, reason) => {
      const comment = {
        type: "Line",
        value: ` ${directive} -- ${reason}`,
      } as const;

      const result = hasReason(comment);

      expect(result).toBeTruthy();
    }
  );
});
