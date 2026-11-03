import type { AuthLoginResponseSchema } from "@workspace/core/auth/schemas";
import { beforeEach, describe, expect, it } from "vitest";

import { authUserStore } from "@/auth/stores/auth-user-store";
import { endSession } from "@/auth/utils/end-session";
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

describe("endSession", () => {
  beforeEach(() => {
    authUserStore.clear();
    queryClient.clear();
  });

  it("discards the Session", () => {
    authUserStore.set(validUser);

    endSession();

    expect(authUserStore.get()).toBeNull();
  });

  it("discards the previous Session's cached queries", () => {
    authUserStore.set(validUser);
    queryClient.setQueryData(["users", "detail"], { id: 1 });

    endSession();

    expect(queryClient.getQueryData(["users", "detail"])).toBeUndefined();
  });
});
