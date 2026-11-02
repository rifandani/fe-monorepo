import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { beforeEach, describe, expect, it } from "vitest";

import { authUserStore } from "@/auth/stores/auth-user-store";
import { sessionAuth } from "@/auth/utils/session-auth";
import { queryClient } from "@/core/providers/query/client";

const validUser: AuthLoginResponseSchema = {
  accessToken: "access",
  email: "ada@example.com",
  firstName: "Ada",
  gender: "female",
  id: 1,
  image: "https://example.com/a.png",
  lastName: "Lovelace",
  refreshToken: "refresh",
  username: "ada",
};

describe("sessionAuth", () => {
  beforeEach(() => {
    authUserStore.clear();
    queryClient.clear();
  });

  it("offers the Access Token of the current Session", () => {
    authUserStore.set(validUser);

    expect(sessionAuth.getToken()).toBe("access");
  });

  it("offers nothing when there is no Session", () => {
    expect(sessionAuth.getToken()).toBeNull();
  });

  it("ends the Session when the server rejects the Access Token", () => {
    authUserStore.set(validUser);

    sessionAuth.onUnauthorized?.();

    expect(authUserStore.get()).toBeNull();
  });
});
