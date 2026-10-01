import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./vitest.msw";

beforeAll(() => {
  server.listen({ onUnhandledFrame: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
