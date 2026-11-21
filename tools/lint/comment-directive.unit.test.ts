import { describe, expect, it } from "vitest";

import { isDirective } from "./comment-directive.ts";

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
