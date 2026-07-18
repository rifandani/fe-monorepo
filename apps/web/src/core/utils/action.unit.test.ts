import { beforeEach, describe, expect, it, vi } from "vitest";

import { actionClient, authActionClient } from "./action";

vi.mock("server-only", () => ({}));

const log = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
}));

vi.mock("@/core/utils/evlog", () => ({ log }));

const getSession = vi.hoisted(() => vi.fn());
const headersMock = vi.hoisted(() =>
  vi.fn(() => new Headers({ cookie: "session=1" }))
);

vi.mock("@/auth/utils/auth", () => ({
  auth: {
    api: {
      getSession,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

describe("actionClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs logging middleware and returns action data", async () => {
    const action = actionClient
      .metadata({ actionName: "ping" })
      .action(() => Promise.resolve({ ok: true }));

    const result = await action();

    expect(result.data).toEqual({ ok: true });
    expect(log.info).toHaveBeenCalledWith(
      "action.client",
      expect.stringContaining("ping action took")
    );
  });

  it("maps thrown Error via handleServerError", async () => {
    const action = actionClient.metadata({ actionName: "fail" }).action(() => {
      throw new Error("kaboom");
    });

    const result = await action();

    expect(result.serverError).toBe("kaboom");
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({
        area: "action.client",
        phase: "handleServerError",
      })
    );
  });
});

describe("authActionClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when session lookup throws", async () => {
    getSession.mockRejectedValue(new Error("db unavailable"));

    const action = authActionClient
      .metadata({ actionName: "secure" })
      .action(() => Promise.resolve("secret"));

    const result = await action();

    expect(result.serverError).toContain("Unauthorized: Error getting session");
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({
        area: "authActionClient",
        phase: "getSession",
      })
    );
  });

  it("rejects when session is missing", async () => {
    getSession.mockResolvedValue(null);

    const action = authActionClient
      .metadata({ actionName: "secure" })
      .action(() => Promise.resolve("secret"));

    const result = await action();

    expect(result.serverError).toContain("Unauthorized: No session found");
  });

  it("passes session into action context when valid", async () => {
    const session = {
      session: { id: "s1" },
      user: { id: "u1", email: "a@b.com" },
    };
    getSession.mockResolvedValue(session);

    const action = authActionClient
      .metadata({ actionName: "secure" })
      .action(({ ctx }) => Promise.resolve(ctx));

    const result = await action();

    expect(result.data).toEqual(session);
    expect(log.info).toHaveBeenCalledWith(
      "authActionClient",
      "Authorized: Session is valid"
    );
    expect(headersMock).toHaveBeenCalled();
  });
});
