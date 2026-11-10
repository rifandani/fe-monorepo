import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { beforeEach, describe, expect, it } from "vitest";

import { hasValidSession } from "@/features/auth/utils/has-valid-session";
import { persistence } from "@/lib/layers/persistence";

const { registry, sessionAtom } = persistence;

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
    registry.set(sessionAtom, null);
  });

  it("is false when there is no Session", () => {
    expect(hasValidSession()).toBe(false);
  });

  it("is true once a Session exists", () => {
    registry.set(sessionAtom, validUser);

    expect(hasValidSession()).toBe(true);
  });

  it("is false again after the Session ends", () => {
    registry.set(sessionAtom, validUser);
    registry.set(sessionAtom, null);

    expect(hasValidSession()).toBe(false);
  });
});
