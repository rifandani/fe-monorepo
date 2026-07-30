import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./vitest.msw";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
