import { HttpNetworkFrame } from "msw/experimental";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanup } from "vitest-browser-react/pure";

import { persistence } from "@/lib/layers/persistence";
import { queryClient } from "@/providers/query/client";

import { worker } from "./network";

/**
 * The lifecycle and the failure guards of every Route Test. It is a setup file,
 * not an opt-in fixture, so no test can forget it.
 *
 * A test fails on its own when, during it:
 *
 * 1. the app sends a request that leaves the test server and that no handler
 *    answers (the real API is never reached), or
 * 2. anything calls `console.error`.
 *
 * Uncaught errors and unhandled rejections already fail the run in Vitest.
 * Each message names the exact request or error, so the cause is in the report.
 */

const unhandledRequests: string[] = [];
const consoleErrors: string[] = [];

/**
 * `console.error` calls that are expected and harmless. Add an entry only with a
 * reason, and match it as narrowly as possible.
 */
const allowedConsoleErrors: readonly RegExp[] = [];

const toText = (args: readonly unknown[]) =>
  args
    .map((arg) =>
      arg instanceof Error ? (arg.stack ?? arg.message) : String(arg)
    )
    .join(" ");

beforeAll(async () => {
  await worker.start({
    quiet: true,
    onUnhandledFrame({ frame }) {
      if (!(frame instanceof HttpNetworkFrame)) {
        return;
      }

      const { request } = frame.data;

      // Same-origin requests are the test server's own: Vite modules, chunks,
      // assets. Only a request that leaves it is "the network".
      if (new URL(request.url).origin !== globalThis.location.origin) {
        unhandledRequests.push(`${request.method} ${request.url}`);
      }
    },
  });
});

beforeEach(() => {
  const original = console.error.bind(console);

  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    const text = toText(args);

    if (!allowedConsoleErrors.some((allowed) => allowed.test(text))) {
      consoleErrors.push(text);
    }

    original(...args);
  });
});

afterEach(async () => {
  // Unmount first, so no route reacts to the resets below.
  await cleanup();

  queryClient.clear();
  localStorage.clear();
  // Each persisted atom caches its value: read it again from the now-empty
  // storage, so the next test starts with the defaults.
  persistence.registry.refresh(persistence.sessionAtom);
  persistence.registry.refresh(persistence.themeAtom);
  persistence.registry.refresh(persistence.localeAtom);

  worker.resetHandlers();
  vi.restoreAllMocks();

  const failures = [
    ...unhandledRequests.map(
      (request) =>
        `Unhandled request: ${request}. Add a handler in e2e/support/network.ts or with worker.use() in the test.`
    ),
    ...consoleErrors.map((error) => `console.error: ${error}`),
  ];

  unhandledRequests.length = 0;
  consoleErrors.length = 0;

  if (failures.length > 0) {
    throw new Error(`Route Test guard failed:\n- ${failures.join("\n- ")}`);
  }
});

afterAll(async () => {
  await worker.stop();
});
