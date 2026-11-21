import { HttpNetworkFrame } from "msw/experimental";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanup } from "vitest-browser-react/pure";

import { persistence } from "@/lib/layers/persistence";
import { queryClient } from "@/providers/query/client";

import { worker } from "./network";

const unhandledRequests: string[] = [];
const consoleErrors: string[] = [];

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
  await cleanup();

  queryClient.clear();
  localStorage.clear();
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
