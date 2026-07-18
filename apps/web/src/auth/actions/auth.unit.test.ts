import type * as OtelApi from "@opentelemetry/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loginAction, logoutAction, registerAction } from "./auth";

vi.mock("server-only", () => ({}));

const log = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
}));

vi.mock("@/core/utils/evlog", () => ({ log }));

const authApi = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signUpEmail: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("@/auth/utils/auth", () => ({
  auth: { api: authApi },
}));

const headersMock = vi.hoisted(() =>
  vi.fn(() => new Headers({ cookie: "x=1" }))
);

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

const redirect = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  redirect,
}));

vi.mock("@opentelemetry/api", async (importOriginal) => {
  const actual = await importOriginal<typeof OtelApi>();
  const counter = { add: vi.fn() };
  const meter = {
    createCounter: vi.fn(() => counter),
  };
  return {
    ...actual,
    metrics: {
      ...actual.metrics,
      getMeter: vi.fn(() => meter),
    },
    trace: {
      ...actual.trace,
      getTracer: vi.fn(() => actual.trace.getTracer("test")),
    },
  };
});

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loginAction", () => {
    it("returns mapped error when sign-in fails", async () => {
      authApi.signInEmail.mockRejectedValue(new Error("bad credentials"));

      const result = await loginAction({
        email: "a@b.com",
        password: "password1",
      });

      expect(result.data).toEqual({
        data: null,
        error: "bad credentials",
      });
      expect(redirect).not.toHaveBeenCalled();
    });

    it("redirects home on success", async () => {
      authApi.signInEmail.mockResolvedValue({
        token: "t",
        user: { id: "u1", email: "a@b.com" },
        redirect: false,
        url: null,
      });

      await loginAction({
        email: "a@b.com",
        password: "password1",
      });

      expect(authApi.signInEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            email: "a@b.com",
            password: "password1",
            callbackURL: "/",
          }),
        })
      );
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("returns validation errors for invalid input", async () => {
      const result = await loginAction({
        email: "not-an-email",
        password: "short",
      });

      expect(result.validationErrors).toBeDefined();
      expect(authApi.signInEmail).not.toHaveBeenCalled();
    });
  });

  describe("registerAction", () => {
    it("returns mapped error when sign-up fails", async () => {
      authApi.signUpEmail.mockRejectedValue(new Error("email taken"));

      const result = await registerAction({
        email: "a@b.com",
        name: "Ada",
        password: "password1",
      });

      expect(result.data).toEqual({
        data: null,
        error: "email taken",
      });
      expect(redirect).not.toHaveBeenCalled();
    });

    it("redirects home on success", async () => {
      authApi.signUpEmail.mockResolvedValue({
        token: "t",
        user: { id: "u1", email: "a@b.com" },
      });

      await registerAction({
        email: "a@b.com",
        name: "Ada Lovelace",
        password: "password1",
      });

      expect(authApi.signUpEmail).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/");
    });
  });

  describe("logoutAction", () => {
    it("returns mapped error when sign-out fails", async () => {
      authApi.signOut.mockRejectedValue(new Error("session gone"));

      const result = await logoutAction();

      expect(result.data).toEqual({
        data: null,
        error: "session gone",
      });
      expect(redirect).not.toHaveBeenCalled();
    });

    it("redirects to login on success", async () => {
      authApi.signOut.mockResolvedValue({ success: true });

      await logoutAction();

      expect(authApi.signOut).toHaveBeenCalled();
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });
});
