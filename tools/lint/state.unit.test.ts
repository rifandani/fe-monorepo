import { RuleTester } from "oxlint/plugins-dev";

import { noBooleanFlagCluster } from "./state.ts";

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "tsx" } },
});

const cluster = (code: string, names: readonly string[]) => ({
  code,
  errors: [{ data: { names: names.join(", ") }, messageId: "cluster" }],
});

const component = (body: string) =>
  `import { useState } from "react"; export const Panel = () => { ${body} return null; };`;

tester.run("state/no-boolean-flag-cluster", noBooleanFlagCluster, {
  valid: [
    component(
      "const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false);"
    ),
    component(
      'const [open] = useState(false); const [busy] = useState(false); const [label] = useState("x"); const [count] = useState(0);'
    ),
    component(
      "const [a] = useState<boolean | null>(null); const [b] = useState<string>(''); const [c] = useState(flag);"
    ),
    `import { useState } from "react";
     const First = () => { const [a] = useState(false); const [b] = useState(true); return null; };
     const Second = () => { const [c] = useState(false); const [d] = useState(true); return null; };`,
    `import { useState } from "react";
     const Outer = () => {
       const [a] = useState(false);
       const [b] = useState(false);
       const Inner = () => { const [c] = useState(false); return null; };
       return Inner;
     };`,
    "let started = false; let pending = false; const done = false;",
    "let started = false; let pending = false; let count = 0; let label = 'x';",
    "const run = () => { let a = false; let b = false; let c = false; return a || b || c; };",
    "const useState = (value) => [value]; const [a] = useState(false); const [b] = useState(false); const [c] = useState(false);",
    "let a = false; let b = false; const view = () => { const [c] = React.useState(false); return c; };",
    `import type { useState } from "react";
     const Panel = () => { const [a] = useState(false); const [b] = useState(false); const [c] = useState(false); return null; };`,
    component(
      "const [a] = useState(false); const [b] = useState(false); const [c] = useState(() => { return false; });"
    ),
  ],
  invalid: [
    cluster(
      component(
        "const [offlineReady, setOfflineReady] = useState(false); const [needRefresh, setNeedRefresh] = useState(false); const [dismissed, setDismissed] = useState(true);"
      ),
      ["offlineReady", "needRefresh", "dismissed"]
    ),
    cluster(
      component(
        "const [a] = useState<boolean>(); const [b] = useState<boolean>(initial); const [c] = useState(() => false);"
      ),
      ["a", "b", "c"]
    ),
    cluster(
      `import * as React from "react";
       function Panel() {
         const [a] = React.useState(false);
         const [b] = React.useState(false);
         const [c] = React.useState(false);
         return null;
       }`,
      ["a", "b", "c"]
    ),
    cluster(
      `import React from "react";
       const Panel = function () {
         const [a] = React.useState(false);
         const [b] = React.useState(false);
         const [c] = React.useState(false);
         return null;
       };`,
      ["a", "b", "c"]
    ),
    cluster(
      `import { useState as useLocal } from "react";
       const Panel = () => {
         const [a] = useLocal(false);
         const [b] = useLocal(false);
         const [c] = useLocal(false);
         return null;
       };`,
      ["a", "b", "c"]
    ),
    cluster(
      component(
        "const state = useState(false); const [b] = useState(false); const [c] = useState(false);"
      ),
      ["state", "b", "c"]
    ),
    cluster(
      component(
        "const [, setOpen] = useState(false); const [b] = useState(false); const [c] = useState(false);"
      ),
      ["setOpen", "b", "c"]
    ),
    cluster(
      `import { useState } from "react";
       const useFlow = () => {
         const [a] = useState(false);
         const [b] = useState(false);
         const [c] = useState(false);
         return [a, b, c];
       };`,
      ["a", "b", "c"]
    ),
    cluster("let started = false; let pending = true; let flushed = false;", [
      "started",
      "pending",
      "flushed",
    ]),
    cluster(
      "let started: boolean; export let pending = false, flushed = !started;",
      ["started", "pending", "flushed"]
    ),
    cluster(
      "let started = false as boolean; let pending = (true); let flushed = false satisfies boolean;",
      ["started", "pending", "flushed"]
    ),
  ],
});
