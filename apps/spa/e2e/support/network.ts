import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { Schema } from "effect";
import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";

export const emily = {
  username: "emilys",
  password: "emilyspass",
} as const;

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

const isEmilyCredentials = Schema.is(
  Schema.Struct({
    username: Schema.Literal(emily.username),
    password: Schema.Literal(emily.password),
  })
);

export const api = (path: string) =>
  `${import.meta.env.VITE_API_BASE_URL}/${path}`;

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
  http.post("/v1/traces", () => new HttpResponse(null, { status: 200 })),
  http.post("/v1/metrics", () => new HttpResponse(null, { status: 200 })),
];

export const worker = setupWorker(...defaultHandlers);
