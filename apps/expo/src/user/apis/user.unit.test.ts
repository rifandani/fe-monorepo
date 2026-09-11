import { MOCK_API_BASE_URL, server } from "@test/msw";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { userApi, userKeys } from "./user";
import type { GetUserApiResponseSchema } from "./user";

// `userApi` closes over the `http` singleton, which now reads the Access Token
// from the store, which persists through `react-native-mmkv` — unloadable in
// Node. Faked at the Module Boundary; nothing about the request under test runs
// through it, and the request itself is still faked at the Network Boundary
// (ADR-0002). The singleton coupling is what ADR-0002 already records as a
// deferred follow-up: `userApi` should take `http` by parameter, as
// `authRepositories(http)` does.
vi.mock("@/core/services/mmkv", async () => {
  const { createMmkvFake } = await import("@test/mmkv");
  return createMmkvFake();
});

const detailUrl = `${MOCK_API_BASE_URL}/users/:id`;

const sampleUser: GetUserApiResponseSchema = {
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

describe("userApi.getDetail", () => {
  it("fetches and returns the parsed user detail", async () => {
    let capturedId: string | readonly string[] | undefined;
    let capturedRequest: Request | undefined;
    server.use(
      http.get(detailUrl, ({ params, request }) => {
        capturedId = params.id;
        capturedRequest = request;
        return HttpResponse.json(sampleUser);
      })
    );

    const result = await userApi.getDetail({ id: 1 });

    // The path param is read off the real request rather than a spy's call args, so this
    // covers the `users/${id}` template *and* the base URL the `http` singleton picked up
    // from `EXPO_PUBLIC_API_BASE_URL` — neither of which the previous module-boundary
    // mock could observe.
    expect(capturedRequest?.method).toBe("GET");
    expect(capturedId).toBe("1");
    expect(result).toEqual(sampleUser);
  });

  it("rejects when the response violates the schema", async () => {
    server.use(
      http.get(detailUrl, () =>
        HttpResponse.json({ ...sampleUser, email: "not-an-email" })
      )
    );

    await expect(userApi.getDetail({ id: 1 })).rejects.toThrow();
  });

  it("rejects on a 404", async () => {
    server.use(
      http.get(detailUrl, () =>
        HttpResponse.json({ message: "User not found" }, { status: 404 })
      )
    );

    await expect(userApi.getDetail({ id: 999 })).rejects.toThrow();
  });
});
