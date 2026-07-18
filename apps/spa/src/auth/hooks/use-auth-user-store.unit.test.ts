import { beforeEach, describe, expect, it } from "vitest";

import { useAuthUserStore, userStoreName } from "./use-auth-user-store";

const validUser = {
  accessToken: "access",
  email: "ada@example.com",
  firstName: "Ada",
  gender: "female" as const,
  id: 1,
  image: "https://example.com/ada.png",
  lastName: "Lovelace",
  refreshToken: "refresh",
  username: "ada",
};

describe("useAuthUserStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthUserStore.setState({ user: null });
  });

  it("exports the persistence store name", () => {
    expect(userStoreName).toBe("app-user");
  });

  it("starts with a null user", () => {
    expect(useAuthUserStore.getState().user).toBeNull();
  });

  it("setUser stores the user and persists under userStoreName", () => {
    useAuthUserStore.getState().setUser(validUser);

    expect(useAuthUserStore.getState().user).toEqual(validUser);

    const raw = localStorage.getItem(userStoreName);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw ?? "{}") as {
      state: { user: typeof validUser };
      version: number;
    };
    expect(parsed.state.user).toEqual(validUser);
    expect(parsed.version).toBe(0);
  });

  it("clearUser nulls the user and updates persistence", () => {
    useAuthUserStore.getState().setUser(validUser);
    useAuthUserStore.getState().clearUser();

    expect(useAuthUserStore.getState().user).toBeNull();

    const raw = localStorage.getItem(userStoreName);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw ?? "{}") as { state: { user: null } };
    expect(parsed.state.user).toBeNull();
  });
});
