import { RuleTester } from "oxlint/plugins-dev";

import { directiveReason, noComments } from "./oxlint-plugin-comments.ts";

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const unexplained = (code: string) => ({ code, errors: 1 });

tester.run("directive-reason", directiveReason, {
  valid: [
    "// oxlint-disable-next-line no-console -- the CLI prints to stdout\nconsole.log(1);",
    "/* eslint-disable no-console -- a CLI entry point */\nconsole.log(1);",
    "console.log(1); // oxlint-disable-line no-console -- the CLI prints",
    "// a plain comment\nconst a = 1;",
    "// oxlint-enable no-console\nconst a = 1;",
    "// @ts-expect-error -- the global is deleted on purpose\nconst a = 1;",
    "// fallow-ignore-next-line unused-export -- read by the CLI\nexport const a = 1;",
    "// Stryker disable next-line all: log text is not behaviour\nconst a = 1;",
    "/* v8 ignore next -- @preserve */\nconst a = 1;",
    "const key = 'abc'; // gitleaks:allow -- a test fixture",
    "// @ts-check\nconst a = 1;",
  ],
  invalid: [
    unexplained("// oxlint-disable-next-line no-console\nconsole.log(1);"),
    unexplained("/* eslint-disable no-console */\nconsole.log(1);"),
    unexplained("console.log(1); // oxlint-disable-line no-console"),
    unexplained("// oxlint-disable-next-line no-console --\nconsole.log(1);"),
    unexplained(
      "// oxlint-disable-next-line no-console - why\nconsole.log(1);"
    ),
    unexplained("/**\n * oxlint-disable no-console\n */\nconsole.log(1);"),
    unexplained("// @ts-expect-error\nconst a: string = 1;"),
    unexplained("// @ts-ignore\nconst a: string = 1;"),
    unexplained("// @ts-expect-error the global is deleted\nconst a = 1;"),
    unexplained("// @ts-nocheck\nconst a = 1;"),
    unexplained(
      "// fallow-ignore-next-line unused-export\nexport const a = 1;"
    ),
    unexplained("// Stryker disable next-line all\nconst a = 1;"),
    unexplained("/* istanbul ignore next */\nconst a = 1;"),
    unexplained("/* c8 ignore start */\nconst a = 1;"),
    unexplained("const key = 'abc'; // gitleaks:allow"),
  ],
});

tester.run("no-comments", noComments, {
  valid: [
    "// oxlint-disable-next-line no-console -- the CLI prints\nconsole.log(1);",
    "// SAFETY: the key was checked above\nconst a = b as C;",
  ],
  invalid: [unexplained("// explain the trick\nconst a = 1;")],
});
