import type { AuthLoginResponseSchema } from "@workspace/core/apis/auth";
import { beforeEach, describe, expect, it } from "vitest";

import { useAuthUserStore } from "@/auth/hooks/use-auth-user-store";
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
    useAuthUserStore.getState().clearUser();
    queryClient.clear();
  });

  it("discards the Session", () => {
    useAuthUserStore.getState().setUser(validUser);

    endSession();

    expect(useAuthUserStore.getState().user).toBeNull();
  });

  it("discards the previous Session's cached queries", () => {
    useAuthUserStore.getState().setUser(validUser);
    queryClient.setQueryData(["users", "detail"], { id: 1 });

    endSession();

    expect(queryClient.getQueryData(["users", "detail"])).toBeUndefined();
  });
});
