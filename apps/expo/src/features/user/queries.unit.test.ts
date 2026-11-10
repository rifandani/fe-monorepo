import { describe, expect, it } from "@effect/vitest";
import { QueryClient, skipToken } from "@tanstack/react-query";
import { MOCK_API_BASE_URL, server } from "@test/msw";
import { Http } from "@workspace/core/http/http";
import { Session } from "@workspace/core/session/session";
import { Layer, ManagedRuntime } from "effect";
import { FetchHttpClient } from "effect/http";
import { http, HttpResponse } from "msw";

import { userDetailQueryOptions, userKeys } from "@/features/user/queries";

const makeRuntime = () =>
  ManagedRuntime.make(
    Http.layer({ baseUrl: MOCK_API_BASE_URL }).pipe(
      Layer.provide(Session.layerMemory()),
      Layer.provide(FetchHttpClient.layer)
    )
  );

describe("userKeys", () => {
  it("builds list and detail query keys", () => {
    expect(userKeys.all).toEqual(["users"]);
    expect(userKeys.lists()).toEqual(["users", "list"]);
    expect(userKeys.list({ limit: 10 })).toEqual([
      "users",
      "list",
      { limit: 10 },
    ]);
    expect(userKeys.details()).toEqual(["users", "detail"]);
    expect(userKeys.detail({ id: 1 })).toEqual(["users", "detail", { id: 1 }]);
    expect(userKeys.detail()).toEqual(["users", "detail"]);
    expect(userKeys.list()).toEqual(["users", "list"]);
  });
});

describe("userDetailQueryOptions", () => {
  it("skips the query until the id is known", () => {
    expect(userDetailQueryOptions(makeRuntime()).queryFn).toBe(skipToken);
  });

  it("fetches the detail under its key", async () => {
    server.use(
      http.get(`${MOCK_API_BASE_URL}/users/:id`, () =>
        HttpResponse.json({
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
        })
      )
    );
    const runtime = makeRuntime();
    const options = userDetailQueryOptions(runtime, { id: 1 });

    const user = await new QueryClient().query(options);

    expect(options.queryKey).toEqual(["users", "detail", { id: 1 }]);
    expect(user.username).toBe("ada");
    await runtime.dispose();
  });
});
