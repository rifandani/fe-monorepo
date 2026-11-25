import { QueryClient, skipToken } from "@tanstack/react-query";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import { Http } from "@workspace/core/http/http";
import { Session } from "@workspace/core/session/session";
import { Layer, ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { userDetailQueryOptions, userKeys } from "@/features/user/queries";
import type { GetUserApiResponseSchema } from "@/features/user/schemas";

const makeRuntime = () =>
  // oxlint-disable-next-line effect-tests/no-manual-effect-runtime-in-tests -- the unit under test takes a ManagedRuntime, as the app does
  ManagedRuntime.make(
    Http.layer({ baseUrl: MOCK_API_BASE_URL }).pipe(
      Layer.provide(Session.layerMemory()),
      Layer.provide(FetchHttpClient.layer)
    )
  );

const ada: GetUserApiResponseSchema = {
  age: 36,
  birthDate: "1990-01-01",
  bloodGroup: "O+",
  email: "ada@example.com",
  eyeColor: "brown",
  firstName: "Ada",
  gender: "female",
  height: 170,
  id: 1,
  image: "https://example.com/ada.png",
  lastName: "Lovelace",
  maidenName: "",
  password: "secret",
  phone: "+1234567890",
  username: "ada",
  weight: 60,
};

describe("userKeys", () => {
  it("should build the list keys without and with params", () => {
    const keys = [
      userKeys.lists(),
      userKeys.list(),
      userKeys.list({ limit: 10 }),
    ];

    expect(userKeys.all).toEqual(["users"]);
    expect(keys).toEqual([
      ["users", "list"],
      ["users", "list"],
      ["users", "list", { limit: 10 }],
    ]);
  });

  it("should build the detail keys without and with params", () => {
    const keys = [
      userKeys.details(),
      userKeys.detail(),
      userKeys.detail({ id: 1 }),
    ];

    expect(keys).toEqual([
      ["users", "detail"],
      ["users", "detail"],
      ["users", "detail", { id: 1 }],
    ]);
  });
});

describe("userDetailQueryOptions", () => {
  it("should skip the query until the id is known", () => {
    const options = userDetailQueryOptions(makeRuntime());

    expect(options.queryFn).toBe(skipToken);
  });

  it("should fetch the detail under its key", async () => {
    server.use(
      http.get(`${MOCK_API_BASE_URL}/users/:id`, () => HttpResponse.json(ada))
    );
    const runtime = makeRuntime();
    const options = userDetailQueryOptions(runtime, { id: 1 });

    const user = await new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }).query(options);

    expect(options.queryKey).toEqual(["users", "detail", { id: 1 }]);
    expect(user).toEqual(ada);
    await runtime.dispose();
  });
});
