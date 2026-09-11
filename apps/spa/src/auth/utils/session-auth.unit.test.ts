import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { beforeEach, describe, expect, it } from "vitest";

import { useAuthUserStore } from "@/auth/hooks/use-auth-user-store";
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
    useAuthUserStore.getState().clearUser();
    queryClient.clear();
  });

  it("offers the Access Token of the current Session", () => {
    useAuthUserStore.getState().setUser(validUser);

    expect(sessionAuth.getToken()).toBe("access");
  });

  it("offers nothing when there is no Session", () => {
    expect(sessionAuth.getToken()).toBeNull();
  });

  it("ends the Session when the server rejects the Access Token", () => {
    useAuthUserStore.getState().setUser(validUser);

    sessionAuth.onUnauthorized?.();

    expect(useAuthUserStore.getState().user).toBeNull();
  });
});
