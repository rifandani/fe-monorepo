import { HttpNetworkFrame } from "msw/experimental";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

import { worker } from "./network";
import { resetApp } from "./reset-app";

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
  await resetApp();
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
