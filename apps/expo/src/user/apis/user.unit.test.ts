import { beforeEach, describe, expect, it, vi } from "vitest";

import { userApi, userKeys } from "./user";
import type { GetUserApiResponseSchema } from "./user";

const { mockGet } = vi.hoisted(() => ({
  mockGet: vi.fn(),
}));

vi.mock("@/core/services/http", () => ({
  http: {
    instance: {
      get: mockGet,
    },
  },
}));

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
  });
});

describe("userApi.getDetail", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("fetches and returns parsed user detail", async () => {
    const json = vi.fn().mockResolvedValue(sampleUser);
    mockGet.mockReturnValue({ json });

    const result = await userApi.getDetail({ id: 1 });

    expect(mockGet).toHaveBeenCalledWith("users/1");
    expect(json).toHaveBeenCalledOnce();
    expect(result).toEqual(sampleUser);
  });
});
