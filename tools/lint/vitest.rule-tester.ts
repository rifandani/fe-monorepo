import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";

RuleTester.describe = (text, fn) => {
  describe(text, fn);
};

RuleTester.it = (text, fn) => {
  it(text, fn);
};
