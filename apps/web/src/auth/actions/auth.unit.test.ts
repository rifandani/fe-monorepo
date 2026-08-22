import type * as OtelApi from "@opentelemetry/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

const otel = vi.hoisted(() => {
  const span = {
    addEvent: vi.fn(),
    setStatus: vi.fn(),
    end: vi.fn(),
    recordException: vi.fn(),
    setAttributes: vi.fn(),
  };
  const counter = { add: vi.fn() };
  const meter = {
    createCounter: vi.fn(() => counter),
  };
  const tracer = {
    startActiveSpan: vi.fn(
      (
        _name: string,
        _opts: OtelApi.SpanOptions,
        fn: (s: typeof span) => void
      ) => fn(span)
    ),
  };
  return {
    span,
    counter,
    meter,
    tracer,
    getMeter: vi.fn(() => meter),
    getTracer: vi.fn(() => tracer),
  };
});

vi.mock("@opentelemetry/api", async (importOriginal) => {
  const actual = await importOriginal<typeof OtelApi>();
  return {
    ...actual,
    metrics: {
      ...actual.metrics,
      getMeter: otel.getMeter,
    },
    trace: {
      ...actual.trace,
      getTracer: otel.getTracer,
    },
  };
});

const { loginAction, logoutAction, registerAction } = await import("./auth");

// Captured after SUT import, before any `clearAllMocks`.
const meterRegistration = {
  getMeter: [...otel.getMeter.mock.calls],
  createCounter: [...otel.meter.createCounter.mock.calls],
};

const loginFormData = (email: string, password: string) => {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("password", password);
  return formData;
};

const registerFormData = (email: string, name: string, password: string) => {
  const formData = new FormData();
  formData.set("email", email);
  formData.set("name", name);
  formData.set("password", password);
  return formData;
};

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers auth.action meter counters with descriptions", () => {
    expect(meterRegistration.getMeter).toEqual([["auth.action"]]);
    expect(meterRegistration.createCounter).toEqual([
      ["login", { description: "How many times the login action is called" }],
      ["logout", { description: "How many times the logout action is called" }],
      [
        "register",
        { description: "How many times the register action is called" },
      ],
    ]);
  });

  describe("loginAction", () => {
    it("returns mapped error when sign-in fails", async () => {
      authApi.signInEmail.mockRejectedValue(new Error("bad credentials"));

      const result = await loginAction(
        undefined,
        loginFormData("a@b.com", "password1")
      );

      expect(result).toMatchObject({
        errors: ["bad credentials"],
        errorMap: { onServer: "bad credentials" },
      });
      expect(redirect).not.toHaveBeenCalled();
    });

    it("redirects home on success and records the login span event", async () => {
      authApi.signInEmail.mockResolvedValue({
        token: "t",
        user: { id: "u1", email: "a@b.com" },
        redirect: false,
        url: null,
      });

      await loginAction(undefined, loginFormData("a@b.com", "password1"));

      expect(authApi.signInEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            email: "a@b.com",
            password: "password1",
            callbackURL: "/",
          }),
        })
      );
      expect(otel.getTracer).toHaveBeenCalledWith("auth.action");
      expect(otel.tracer.startActiveSpan).toHaveBeenCalledWith(
        "loginAction",
        expect.anything(),
        expect.any(Function)
      );
      expect(otel.counter.add).toHaveBeenCalledWith(1);
      expect(otel.span.addEvent).toHaveBeenCalledWith("Login success", {
        token: "t",
        "user.email": "a@b.com",
        "user.id": "u1",
      });
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("returns validation errors for invalid input", async () => {
      const result = await loginAction(
        undefined,
        loginFormData("not-an-email", "short")
      );

      expect(result).toMatchObject({
        errorMap: expect.objectContaining({
          onServer: expect.anything(),
        }),
      });
      expect(authApi.signInEmail).not.toHaveBeenCalled();
    });

    it("rethrows non-validation errors", async () => {
      // SAFETY: the action is typed to receive FormData; `null` exercises the
      // non-validation failure path a malformed client request produces.
      await expect(loginAction(undefined, null as never)).rejects.toThrow();
      expect(authApi.signInEmail).not.toHaveBeenCalled();
    });
  });

  describe("registerAction", () => {
    it("returns mapped error when sign-up fails", async () => {
      authApi.signUpEmail.mockRejectedValue(new Error("email taken"));

      const result = await registerAction(
        undefined,
        registerFormData("a@b.com", "Ada Lovelace", "password1")
      );

      expect(result).toMatchObject({
        errors: ["email taken"],
        errorMap: { onServer: "email taken" },
      });
      expect(redirect).not.toHaveBeenCalled();
    });

    it("redirects home on success and records the register span event", async () => {
      authApi.signUpEmail.mockResolvedValue({
        token: "t",
        user: { id: "u1", email: "a@b.com" },
      });

      await registerAction(
        undefined,
        registerFormData("a@b.com", "Ada Lovelace", "password1")
      );

      expect(authApi.signUpEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            email: "a@b.com",
            name: "Ada Lovelace",
            password: "password1",
            callbackURL: "/",
          }),
        })
      );
      expect(otel.tracer.startActiveSpan).toHaveBeenCalledWith(
        "registerAction",
        expect.anything(),
        expect.any(Function)
      );
      expect(otel.span.addEvent).toHaveBeenCalledWith("Register success", {
        "user.email": "a@b.com",
        "user.id": "u1",
      });
      expect(redirect).toHaveBeenCalledWith("/");
    });

    it("returns validation errors for invalid input", async () => {
      const result = await registerAction(
        undefined,
        registerFormData("not-an-email", "A", "short")
      );

      expect(result).toMatchObject({
        errorMap: expect.objectContaining({
          onServer: expect.anything(),
        }),
      });
      expect(authApi.signUpEmail).not.toHaveBeenCalled();
    });

    it("rethrows non-validation errors", async () => {
      // SAFETY: as above - `null` stands in for a malformed client submission.
      await expect(registerAction(undefined, null as never)).rejects.toThrow();
      expect(authApi.signUpEmail).not.toHaveBeenCalled();
    });
  });

  describe("logoutAction", () => {
    it("returns mapped error when sign-out fails", async () => {
      authApi.signOut.mockRejectedValue(new Error("session gone"));

      const result = await logoutAction();

      expect(result).toEqual({ error: "session gone" });
      expect(redirect).not.toHaveBeenCalled();
    });

    it("redirects to login on success and records the logout span event", async () => {
      authApi.signOut.mockResolvedValue({ success: true });

      await logoutAction();

      expect(authApi.signOut).toHaveBeenCalled();
      expect(otel.tracer.startActiveSpan).toHaveBeenCalledWith(
        "logoutAction",
        expect.anything(),
        expect.any(Function)
      );
      expect(otel.span.addEvent).toHaveBeenCalledWith("Logout success", {
        success: true,
      });
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });
});
