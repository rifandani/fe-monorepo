import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { beforeEach, describe, expect, it } from "vitest";

import { authUserStore } from "@/auth/stores/auth-user-store";
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
    authUserStore.clear();
  });

  it("is false when there is no Session", () => {
    expect(hasValidSession()).toBe(false);
  });

  it("is true once a Session exists", () => {
    authUserStore.set(validUser);

    expect(hasValidSession()).toBe(true);
  });

  it("is false again after the Session ends", () => {
    authUserStore.set(validUser);
    authUserStore.clear();

    expect(hasValidSession()).toBe(false);
  });
});
