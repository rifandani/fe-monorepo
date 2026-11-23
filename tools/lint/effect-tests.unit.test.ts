import { RuleTester } from "oxlint/plugins-dev";

import { noManualEffectRuntimeInTests as rule } from "./effect-tests.ts";

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const inTest = (code: string) => ({ code, filename: "src/user.test.ts" });

const reported = (code: string) => ({
  ...inTest(code),
  errors: [{ messageId: "manualRunner" }],
});

tester.run("no-manual-effect-runtime-in-tests", rule, {
  valid: [
    inTest('it.effect("should read", () => Effect.succeed(1));'),
    inTest("const program = Effect.map(Effect.succeed(1), String);"),
    inTest("runtime.runSync(program);"),
    inTest("Other.runSync(program);"),
    { code: "Effect.runSync(program);", filename: "src/main.ts" },
    { code: "Effect.runPromise(program);", filename: "src/user.ts" },
  ],
  invalid: [
    reported("Effect.runSync(program);"),
    reported("await Effect.runPromise(program);"),
    reported("Effect.runFork(program);"),
    reported("Effect.runPromiseExit(program);"),
    reported("ManagedRuntime.make(layer);"),
    {
      code: "Effect.runSync(program);",
      filename: "src/user.spec.tsx",
      errors: [{ messageId: "manualRunner" }],
    },
  ],
});
