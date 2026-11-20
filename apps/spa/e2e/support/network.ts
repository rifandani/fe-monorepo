import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";

/**
 * The person every signed-in Route Test acts as. Fixed literals, never faker:
 * a failure must reproduce the same way on every run (ADR-0002).
 */
export const emily = {
  username: "emilys",
  password: "emilyspass",
} as const;

/** The Session a successful login of `emily` produces. */
export const emilySession: AuthLoginResponseSchema = {
  accessToken: "e2e-access",
  email: "emily.johnson@x.dummyjson.com",
  firstName: "Emily",
  gender: "female",
  id: 1,
  image: "https://dummyjson.com/icon/emilys/128",
  lastName: "Johnson",
  refreshToken: "e2e-refresh",
  username: emily.username,
};

/** Matches a login body with exactly `emily`'s username and password. */
const isEmilyCredentials = Schema.is(
  Schema.Struct({
    username: Schema.Literal(emily.username),
    password: Schema.Literal(emily.password),
  })
);

/**
 * Build an absolute URL on the mock API, so handlers never depend on `baseURI`.
 * `vitest.e2e.config.ts` pins `VITE_API_BASE_URL` with `define`, and the app and
 * these handlers both read it, so they cannot drift apart.
 */
const api = (path: string) => `${import.meta.env.VITE_API_BASE_URL}/${path}`;

/**
 * The default, happy-path backend. It answers what the app needs to boot and to
 * sign `emily` in. A test that needs a different answer replaces one handler
 * with `worker.use(...)`; `setup.ts` resets the overrides after each test.
 */
const defaultHandlers = [
  http.post(api("auth/login"), async ({ request }) => {
    const body: unknown = await request.json();

    if (isEmilyCredentials(body)) {
      return HttpResponse.json(emilySession);
    }

    return HttpResponse.json(
      { message: "Invalid credentials" },
      { status: 400 }
    );
  }),
  // Telemetry exports go same-origin in dev (`lib/layers/telemetry.ts`). Accept
  // and drop them, so a batch flush during a test never reaches a collector.
  http.post("/v1/traces", () => new HttpResponse(null, { status: 200 })),
  http.post("/v1/metrics", () => new HttpResponse(null, { status: 200 })),
];

/** The one Mock Service Worker of a test file. `setup.ts` owns its lifecycle. */
export const worker = setupWorker(...defaultHandlers);
