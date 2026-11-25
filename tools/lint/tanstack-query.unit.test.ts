import { RuleTester } from "oxlint/plugins-dev";

import { explicitRetry } from "./tanstack-query.ts";

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: "ts" } },
});

const IMPORT = 'import { QueryClient } from "@tanstack/react-query";';

const missing = (
  code: string,
  kinds: readonly ("queries" | "mutations")[]
) => ({
  code,
  errors: kinds.map((kind) => ({ data: { kind }, messageId: "missingRetry" })),
});

const unverifiable = (code: string) => ({
  code,
  errors: [{ messageId: "unverifiableOptions" }],
});

tester.run("tanstack-query/explicit-retry", explicitRetry, {
  valid: [
    `${IMPORT} new QueryClient({ defaultOptions: { queries: { retry: 3 }, mutations: { retry: false } } });`,
    `${IMPORT} new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, networkMode: "offlineFirst", retry: (count) => count < 3 }, mutations: { retry: 0 } } });`,
    `${IMPORT} new QueryClient({ defaultOptions: { "queries": { "retry": false }, "mutations": { "retry": false } } } as const);`,
    'import { QueryClient as Client } from "@tanstack/query-core"; new Client({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });',
    "new Map();",
    'import * as ReactQuery from "@tanstack/react-query"; new ReactQuery.QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });',
    "new Other.QueryClient();",
    'import { QueryClient as Client } from "@tanstack/react-query"; new Other();',
  ],
  invalid: [
    missing(
      `${IMPORT} new QueryClient({ defaultOptions: { queries: { staleTime: 0 }, mutations: { retry: false } } });`,
      ["queries"]
    ),
    missing(
      `${IMPORT} new QueryClient({ defaultOptions: { queries: { retry: 3 } } });`,
      ["mutations"]
    ),
    missing(
      `${IMPORT} new QueryClient({ defaultOptions: { queries: { retry: 3 }, mutations: {} } });`,
      ["mutations"]
    ),
    missing(`${IMPORT} new QueryClient();`, ["queries", "mutations"]),
    missing(`${IMPORT} new QueryClient({});`, ["queries", "mutations"]),
    missing(`${IMPORT} new QueryClient({ defaultOptions: {} });`, [
      "queries",
      "mutations",
    ]),
    missing(
      `${IMPORT} new QueryClient({ defaultOptions: { queries: { [key]: 3 }, mutations: { retry: false } } });`,
      ["queries"]
    ),
    missing(
      `${IMPORT} new QueryClient({ defaultOptions: { queries: sharedQueries, mutations: { retry: false } } });`,
      ["queries"]
    ),
    missing(`${IMPORT} new QueryClient({ defaultOptions: sharedDefaults });`, [
      "queries",
      "mutations",
    ]),
    missing(
      `${IMPORT} new QueryClient({ defaultOptions: { queries: { ...sharedQueries }, mutations: { retry: false } } });`,
      ["queries"]
    ),
    missing(
      'import { QueryClient as Client } from "@tanstack/react-query"; new Client();',
      ["queries", "mutations"]
    ),
    missing(
      'import * as ReactQuery from "@tanstack/react-query"; new ReactQuery.QueryClient();',
      ["queries", "mutations"]
    ),
    unverifiable(`${IMPORT} new QueryClient(options);`),
    unverifiable(`${IMPORT} new QueryClient(...args);`),
  ],
});
