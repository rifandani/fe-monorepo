import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { beforeEach, describe, expect, it } from "vitest";

import { useAuthUserStore } from "@/auth/hooks/use-auth-user-store";
import { hasValidSession } from "@/auth/utils/has-valid-session";

const validUser: AuthLoginResponseSchema = {
  accessToken: "access",
  email: "ada@example.com",
  firstName: "Ada",
  gender: "female",
  id: 1,
  image: "https://example.com/ada.png",
  lastName: "Lovelace",
  refreshToken: "refresh",
  username: "ada",
};

describe("hasValidSession", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthUserStore.setState({ user: null });
  });

  it("is false when there is no Session", () => {
    expect(hasValidSession()).toBe(false);
  });

  it("is true once a Session exists", () => {
    useAuthUserStore.getState().setUser(validUser);

    expect(hasValidSession()).toBe(true);
  });

  it("is false again after the Session ends", () => {
    useAuthUserStore.getState().setUser(validUser);
    useAuthUserStore.getState().clearUser();

    expect(hasValidSession()).toBe(false);
  });
});
